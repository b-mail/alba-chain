from __future__ import annotations

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.api.v1.serializers import serialize_extra_shift
from app.core.db import get_db
from app.models import Evidence, ExtraShift, LaborContract, WorkRecord
from app.schemas import (
    ExtraShiftConfirmResponse,
    ExtraShiftCreate,
    ExtraShiftMappingRequest,
    ExtraShiftRejectRequest,
    JobAccepted,
)
from app.schemas import ExtraShift as ExtraShiftSchema
from app.schemas.pay import PayEstimate
from app.services import mapping_service, pay_service, pdf_service
from app.services import pubsub
from app.workers import job_runner

router = APIRouter(prefix="/extra-shifts", tags=["extra-shifts"])


@router.post("", status_code=201, response_model=ExtraShiftSchema)
def create_extra_shift(
    payload: ExtraShiftCreate, db: Session = Depends(get_db)
) -> ExtraShiftSchema:
    shift = ExtraShift(
        store_id=payload.store_id,
        employee_id=payload.employee_id,
        shift_type=payload.shift_type,
        status="evidence_uploaded",
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return serialize_extra_shift(shift)


@router.post("/{id}/evidences", status_code=202, response_model=JobAccepted)
async def upload_evidence(
    id: int,
    background: BackgroundTasks,
    evidence_type: str = Form(...),
    raw_content: str | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> JobAccepted:
    """증빙 업로드 → VLM 해석 잡 트리거."""
    shift = db.get(ExtraShift, id)
    if shift is None:
        raise HTTPException(status_code=404, detail="extra_shift_not_found")

    file_url = None
    if file is not None:
        contents = await file.read()
        _, file_url = pdf_service.save_upload(
            contents, file.filename or "evidence.png", subdir="evidences"
        )

    db.add(
        Evidence(
            extra_shift_id=shift.id,
            evidence_type=evidence_type,
            file_url=file_url,
            raw_content=raw_content,
        )
    )
    shift.status = "interpreting"
    db.add(shift)
    db.commit()

    job = job_runner.enqueue(
        db, job_type="vlm_interpret", resource_type="extra_shift", resource_id=shift.id
    )
    background.add_task(job_runner.run_job, job.id)

    return JobAccepted(
        job_id=job.id, status="queued", poll_url=f"/api/v1/agent-jobs/{job.id}"
    )


@router.get("/{id}", response_model=ExtraShiftSchema)
def get_extra_shift(id: int, db: Session = Depends(get_db)) -> ExtraShiftSchema:
    """VLM 해석 결과 + 매핑 후보 조회."""
    shift = db.get(ExtraShift, id)
    if shift is None:
        raise HTTPException(status_code=404, detail="extra_shift_not_found")

    candidates = None
    if shift.status in ("interpreted", "mapped"):
        candidates = mapping_service.suggest_candidates(db, shift)
    return serialize_extra_shift(shift, mapping_candidates=candidates)


@router.patch("/{id}/mapping", response_model=ExtraShiftSchema)
def map_extra_shift(
    id: int, payload: ExtraShiftMappingRequest, db: Session = Depends(get_db)
) -> ExtraShiftSchema:
    """기존 계약 노드에 강제 매핑 확정. 시간 생략 시 VLM 해석값으로 채운다."""
    shift = db.get(ExtraShift, id)
    if shift is None:
        raise HTTPException(status_code=404, detail="extra_shift_not_found")
    if shift.status not in ("interpreted", "mapped"):
        raise HTTPException(status_code=409, detail="must_interpret_before_mapping")

    contract = db.get(LaborContract, payload.contract_id)
    if contract is None:
        raise HTTPException(status_code=404, detail="contract_not_found")
    if contract.employee_id is not None and contract.employee_id != shift.employee_id:
        raise HTTPException(status_code=400, detail="contract_employee_mismatch")

    # start/end 폴백: 요청 → 기존 VLM 해석값
    start_at = payload.start_at or shift.start_at
    end_at = payload.end_at or shift.end_at
    if start_at is None or end_at is None:
        raise HTTPException(status_code=400, detail="missing_start_end")
    if end_at <= start_at:
        raise HTTPException(status_code=400, detail="end_must_be_after_start")

    node_id = payload.node_id or mapping_service.default_attendance_node(
        db, payload.contract_id
    )

    shift.mapped_contract_id = payload.contract_id
    shift.mapped_node_id = node_id
    shift.start_at = start_at
    shift.end_at = end_at
    shift.work_date = start_at.date()
    shift.worked_minutes = int((end_at - start_at).total_seconds() // 60)
    shift.status = "mapped"
    db.add(shift)
    db.commit()
    db.refresh(shift)

    # 매핑 시 잠정 예상 급여 push (확정 전 미리보기)
    period_start, period_end = pay_service.current_month_bounds(shift.work_date)
    try:
        provisional = pay_service.compute_estimate(
            db, shift.employee_id, period_start, period_end, include_shift=shift
        )
        pubsub.publish(shift.employee_id, {**provisional, "provisional": True})
    except ValueError:
        pass

    candidates = mapping_service.suggest_candidates(db, shift)
    return serialize_extra_shift(shift, mapping_candidates=candidates)


@router.post("/{id}/confirm", response_model=ExtraShiftConfirmResponse)
def confirm_extra_shift(
    id: int, db: Session = Depends(get_db)
) -> ExtraShiftConfirmResponse:
    """사장 최종 승인 → 근태(work_record) 반영 + 급여 재계산 + SSE 푸시."""
    shift = db.get(ExtraShift, id)
    if shift is None:
        raise HTTPException(status_code=404, detail="extra_shift_not_found")
    if shift.status != "mapped":
        raise HTTPException(status_code=409, detail="must_map_before_confirm")

    db.add(
        WorkRecord(
            employee_id=shift.employee_id,
            contract_id=shift.mapped_contract_id,
            extra_shift_id=shift.id,
            record_type=shift.shift_type,
            work_date=shift.work_date,
            start_at=shift.start_at,
            end_at=shift.end_at,
            worked_minutes=shift.worked_minutes or 0,
        )
    )
    shift.status = "confirmed"
    db.add(shift)
    db.commit()
    db.refresh(shift)

    period_start, period_end = pay_service.current_month_bounds(shift.work_date)
    estimate = pay_service.compute_estimate(
        db, shift.employee_id, period_start, period_end
    )
    pubsub.publish(shift.employee_id, estimate)

    base = serialize_extra_shift(shift)
    return ExtraShiftConfirmResponse(
        **base.model_dump(), pay_estimate=PayEstimate(**estimate)
    )


@router.post("/{id}/reject", response_model=ExtraShiftSchema)
def reject_extra_shift(
    id: int,
    payload: ExtraShiftRejectRequest | None = None,
    db: Session = Depends(get_db),
) -> ExtraShiftSchema:
    """증빙/해석 반려 → rejected."""
    shift = db.get(ExtraShift, id)
    if shift is None:
        raise HTTPException(status_code=404, detail="extra_shift_not_found")
    if shift.status == "confirmed":
        raise HTTPException(status_code=409, detail="cannot_reject_confirmed")

    shift.status = "rejected"
    shift.reject_reason = payload.reason if payload else None
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return serialize_extra_shift(shift)
