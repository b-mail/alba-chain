from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class WorkRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    contract_id: int | None = None
    extra_shift_id: int | None = None
    record_type: Literal["scheduled", "substitute", "overtime"]
    work_date: date
    start_at: datetime | None = None
    end_at: datetime | None = None
    worked_minutes: int
