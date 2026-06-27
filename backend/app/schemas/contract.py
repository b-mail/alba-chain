from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class WorkScheduleInput(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: str = Field(examples=["18:00"])
    end_time: str = Field(examples=["22:00"])
    break_minutes: int = 0


class ContractTermsInput(BaseModel):
    hourly_wage: int | None = Field(default=None, examples=[11000])
    weekly_hours: float | None = Field(default=None, examples=[12.0])
    work_start_date: date | None = None
    work_end_date: date | None = None
    pay_day: int | None = Field(default=None, examples=[10])
    tax_type: str | None = Field(default=None, examples=["freelance_3_3"])
    weekly_holiday_eligible: bool | None = None
    schedules: list[WorkScheduleInput] = Field(default_factory=list)


class ContractDraftRequest(BaseModel):
    store_id: int
    employee_id: int | None = None
    raw_text: str = Field(
        examples=["김알바 시급 11000원, 월수금 18시~22시 근무, 4대보험 미가입 3.3%"]
    )


class ContractSendRequest(BaseModel):
    employee_phone: str = Field(examples=["010-1234-5678"])


class ContractDocument(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    contract_id: int
    doc_type: Literal["original_pdf", "ocr_txt", "generated_pdf"]
    file_url: str


class Contract(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: int
    employee_id: int | None = None
    source: Literal["uploaded", "generated"]
    status: Literal[
        "draft",
        "parsing",
        "extracted",
        "pending_signature",
        "active",
        "expired",
        "failed",
    ]
    raw_text: str | None = None
    extracted_terms: dict[str, Any] | None = None
    terms: ContractTermsInput | None = None
    created_at: datetime
