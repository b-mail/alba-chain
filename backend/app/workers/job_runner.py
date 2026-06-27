"""비동기 Agent 잡 실행기.

FastAPI BackgroundTasks 에서 호출되며, 각 잡은 독립 DB 세션으로 실행되고
agent_jobs 테이블에 상태를 기록한다(폴링 대상).
"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.models import (
    AgentJob,
    ContractDocument,
    Evidence,
    ExtraShift,
    LaborContract,
)
from app.services import contract_service, extraction_service, pdf_service, vlm_service

logger = logging.getLogger(__name__)


def enqueue(
    db: Session,
    *,
    job_type: str,
    resource_type: str,
    resource_id: int,
) -> AgentJob:
    job = AgentJob(
        job_type=job_type,
        status="queued",
        resource_type=resource_type,
        resource_id=resource_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def run_job(job_id: int) -> None:
    """BackgroundTasks 진입점. 자체 세션을 연다."""
    db = SessionLocal()
    try:
        job = db.get(AgentJob, job_id)
        if job is None:
            logger.error("잡 없음: %s", job_id)
            return
        job.status = "running"
        db.commit()

        try:
            if job.job_type == "contract_parse":
                result = _run_contract_parse(db, job.resource_id)
            elif job.job_type == "vlm_interpret":
                result = _run_vlm_interpret(db, job.resource_id)
            else:
                raise ValueError(f"지원하지 않는 잡 타입: {job.job_type}")
            job.result = result
            job.status = "succeeded"
        except Exception as exc:  # noqa: BLE001
            logger.exception("잡 실패: %s", job_id)
            job.status = "failed"
            job.error = str(exc)
        db.commit()
    finally:
        db.close()


def _run_contract_parse(db: Session, contract_id: int) -> dict[str, Any]:
    contract = db.get(LaborContract, contract_id)
    if contract is None:
        raise ValueError("contract_not_found")

    # 원본 PDF 문서에서 텍스트 추출
    original = next(
        (d for d in contract.documents if d.doc_type == "original_pdf"), None
    )
    raw_text = ""
    if original:
        doc_path = pdf_service.resolve_file_url(original.file_url)
        raw_text = pdf_service.extract_text(doc_path)

    if not raw_text and contract.raw_text:
        raw_text = contract.raw_text

    # OCR/txt 문서 저장
    if raw_text:
        _, txt_url = pdf_service.save_upload(
            raw_text.encode("utf-8"), "ocr.txt", subdir="ocr"
        )
        db.add(
            ContractDocument(
                contract_id=contract.id, doc_type="ocr_txt", file_url=txt_url
            )
        )

    extracted = extraction_service.extract_contract_terms(raw_text)
    contract.raw_text = raw_text or contract.raw_text
    contract.extracted_terms = extracted
    contract.status = "extracted"
    db.add(contract)
    db.commit()

    return {"contract_id": contract.id, "extracted_terms": extracted}


def _run_vlm_interpret(db: Session, extra_shift_id: int) -> dict[str, Any]:
    shift = db.get(ExtraShift, extra_shift_id)
    if shift is None:
        raise ValueError("extra_shift_not_found")

    evidence: Evidence | None = shift.evidences[-1] if shift.evidences else None
    image_bytes = None
    image_mime = None
    raw_content = None
    if evidence:
        raw_content = evidence.raw_content
        if evidence.file_url and evidence.evidence_type == "kakaotalk_image":
            path = pdf_service.resolve_file_url(evidence.file_url)
            if path.exists():
                image_bytes = path.read_bytes()
                image_mime = "image/png"

    result = vlm_service.interpret_evidence(
        raw_content=raw_content,
        image_bytes=image_bytes,
        image_mime=image_mime,
    )

    shift.vlm_extraction = result
    shift.interpreted_context = result.get("event")
    shift.confidence = result.get("confidence")
    start = _parse_dt(result.get("start"))
    end = _parse_dt(result.get("end"))
    shift.start_at = start
    shift.end_at = end
    if start:
        shift.work_date = start.date()
    shift.worked_minutes = result.get("duration_minutes")
    # 해석 완료 → interpreted (매핑 후보는 GET 시 동적으로 산출)
    shift.status = "interpreted"
    db.add(shift)
    db.commit()

    return {"extra_shift_id": shift.id, "vlm_extraction": result}


def _parse_dt(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
