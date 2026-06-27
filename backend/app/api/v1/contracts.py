from __future__ import annotations

import logging

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

from app.api.v1.serializers import serialize_contract
from app.core.db import get_db
from app.models import ContractDocument as ContractDocumentModel
from app.models import LaborContract
from app.schemas import (
    Contract,
    ContractDocument,
    ContractDraftRequest,
    ContractSendRequest,
    ContractTermsInput,
    JobAccepted,
)
from app.services import contract_service, extraction_service, pdf_service
from app.workers import job_runner

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/contracts", tags=["contracts"])


@router.post("/upload", status_code=202, response_model=JobAccepted)
async def upload_contract(
    background: BackgroundTasks,
    store_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> JobAccepted:
    """UF1: 근로계약서 PDF 업로드 → parsing 상태 생성 + contract_parse 잡 트리거."""
    contents = await file.read()
    _, file_url = pdf_service.save_upload(
        contents, file.filename or "contract.pdf", subdir="uploads"
    )

    contract = LaborContract(store_id=store_id, source="uploaded", status="parsing")
    db.add(contract)
    db.commit()
    db.refresh(contract)

    db.add(
        ContractDocumentModel(
            contract_id=contract.id, doc_type="original_pdf", file_url=file_url
        )
    )
    db.commit()

    job = job_runner.enqueue(
        db, job_type="contract_parse", resource_type="contract", resource_id=contract.id
    )
    background.add_task(job_runner.run_job, job.id)

    return JobAccepted(
        job_id=job.id, status="queued", poll_url=f"/api/v1/agent-jobs/{job.id}"
    )


@router.post("/draft", status_code=201, response_model=Contract)
def draft_contract(
    payload: ContractDraftRequest, db: Session = Depends(get_db)
) -> Contract:
    """UF2: 줄글 입력 → 동기 추출 → extracted 상태 초안 생성."""
    extracted = extraction_service.extract_contract_terms(payload.raw_text)
    contract = LaborContract(
        store_id=payload.store_id,
        source="generated",
        status="extracted",
        raw_text=payload.raw_text,
        extracted_terms=extracted,
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return serialize_contract(contract)


@router.get("/{id}", response_model=Contract)
def get_contract(id: int, db: Session = Depends(get_db)) -> Contract:
    contract = db.get(LaborContract, id)
    if contract is None:
        raise HTTPException(status_code=404, detail="contract_not_found")
    return serialize_contract(contract)


@router.patch("/{id}", response_model=Contract)
def update_contract(
    id: int, payload: ContractTermsInput, db: Session = Depends(get_db)
) -> Contract:
    """추출된 계약 조건 수정. 정형 테이블에도 반영한다."""
    contract = db.get(LaborContract, id)
    if contract is None:
        raise HTTPException(status_code=404, detail="contract_not_found")

    terms = payload.model_dump(mode="json")
    contract_service.apply_terms(db, contract, terms)
    db.commit()
    db.refresh(contract)
    return serialize_contract(contract)


@router.post("/{id}/confirm", response_model=Contract)
def confirm_contract(
    id: int,
    payload: ContractTermsInput | None = None,
    db: Session = Depends(get_db),
) -> Contract:
    """UF1: 추출값 검증·확정 → contract_terms/work_schedules/ontology_nodes 정형화, active."""
    contract = db.get(LaborContract, id)
    if contract is None:
        raise HTTPException(status_code=404, detail="contract_not_found")

    provided = payload.model_dump(exclude_none=True) if payload is not None else {}
    if not provided.get("schedules"):
        provided.pop("schedules", None)
    if provided:
        terms = payload.model_dump(mode="json")
    elif contract.extracted_terms:
        terms = contract_service.normalize_terms(contract.extracted_terms)
    else:
        raise HTTPException(status_code=400, detail="no_terms_to_confirm")

    contract_service.apply_terms(db, contract, terms)
    contract.status = "active"
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return serialize_contract(contract)


@router.post("/{id}/generate-pdf", status_code=201, response_model=ContractDocument)
def generate_pdf(id: int, db: Session = Depends(get_db)) -> ContractDocument:
    """UF2: 계약서 PDF 생성."""
    contract = db.get(LaborContract, id)
    if contract is None:
        raise HTTPException(status_code=404, detail="contract_not_found")

    terms = contract.extracted_terms or {}
    file_url = pdf_service.generate_contract_pdf(terms, contract.id)
    doc = ContractDocumentModel(
        contract_id=contract.id, doc_type="generated_pdf", file_url=file_url
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return ContractDocument.model_validate(doc)


@router.post("/{id}/send", response_model=Contract)
def send_contract(
    id: int, payload: ContractSendRequest, db: Session = Depends(get_db)
) -> Contract:
    """UF2: 알바에게 계약서 전송 → pending_signature."""
    contract = db.get(LaborContract, id)
    if contract is None:
        raise HTTPException(status_code=404, detail="contract_not_found")

    # MVP: 실제 발송 대신 로그 (SMS/카톡 연동 자리)
    logger.info(
        "계약서 #%s 전송 → %s", contract.id, payload.employee_phone
    )
    contract.status = "pending_signature"
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return serialize_contract(contract)
