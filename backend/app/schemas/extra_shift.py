from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.pay import PayEstimate


class ExtraShiftCreate(BaseModel):
    store_id: int
    employee_id: int
    shift_type: Literal["substitute", "overtime"]


class ExtraShiftMappingRequest(BaseModel):
    contract_id: int
    node_id: int | None = None
    # 생략 시 VLM 해석 결과(start/end)로 채운다.
    start_at: datetime | None = None
    end_at: datetime | None = None


class ExtraShiftRejectRequest(BaseModel):
    reason: str | None = None


class MappingCandidate(BaseModel):
    contract_id: int
    node_id: int | None = None
    label: str
    score: float
    reason: str
    suggested_start_at: datetime | None = None
    suggested_end_at: datetime | None = None


class VlmExtraction(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event: str | None = None
    requested_by: str | None = None
    start: datetime | None = None
    end: datetime | None = None
    duration_minutes: int | None = None
    confidence: float | None = None


class ExtraShift(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: int
    employee_id: int
    shift_type: Literal["substitute", "overtime"]
    status: Literal[
        "evidence_uploaded",
        "interpreting",
        "interpreted",
        "mapped",
        "confirmed",
        "rejected",
    ]
    mapped_contract_id: int | None = None
    mapped_node_id: int | None = None
    work_date: date | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    worked_minutes: int | None = None
    interpreted_context: str | None = None
    confidence: float | None = None
    reject_reason: str | None = None
    vlm_extraction: VlmExtraction | None = None
    mapping_candidates: list[MappingCandidate] = []


class ExtraShiftConfirmResponse(ExtraShift):
    pay_estimate: PayEstimate | None = None
