from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel


class PayEstimate(BaseModel):
    employee_id: int
    period_start: date
    period_end: date
    base_minutes: int = 0
    extra_minutes: int = 0
    gross_pay: int = 0
    weekly_holiday_pay: int = 0
    tax_amount: int = 0
    net_pay: int = 0
    breakdown: dict[str, Any] = {}
