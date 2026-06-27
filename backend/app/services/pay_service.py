"""실시간 예상 급여 계산.

- base: 활성 계약의 근무 스케줄을 기간에 펼쳐 산정
- extra: 확정된 대타/추가근무(work_records) 합산 (추가근무는 가산율 적용)
- 주휴수당: 주 소정근로 15시간 이상 시 (주간시간/40)*8*시급
- 세금: 프리랜서 3.3% / 4대보험 가입 시 근사 9.4%
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    ContractTerm,
    Employee,
    ExtraShift,
    LaborContract,
    WorkRecord,
    WorkSchedule,
)

OVERTIME_MULTIPLIER = 1.5
FREELANCE_TAX_RATE = 0.033
FOUR_INSURANCE_RATE = 0.094


def _active_contract(db: Session, employee_id: int) -> LaborContract | None:
    """급여 산정 기준 계약: 조건이 확정(terms 존재)된 계약 중 최신.

    confirm 이후 send 로 pending_signature 가 되어도 급여 추정에는 포함한다.
    """
    stmt = (
        select(LaborContract)
        .join(ContractTerm, ContractTerm.contract_id == LaborContract.id)
        .where(LaborContract.employee_id == employee_id)
        .order_by(LaborContract.created_at.desc())
    )
    return db.execute(stmt).scalars().first()


def _time_to_minutes(value: str) -> int:
    h, m = value.split(":")
    return int(h) * 60 + int(m)


def _schedule_minutes_in_period(
    schedules: list[WorkSchedule], start: date, end: date
) -> tuple[int, dict[str, int]]:
    """스케줄을 기간에 펼쳐 일자별 소정근로 분을 합산."""
    by_dow: dict[int, int] = {}
    for s in schedules:
        minutes = _time_to_minutes(s.end_time) - _time_to_minutes(s.start_time)
        minutes -= s.break_minutes or 0
        by_dow[s.day_of_week] = max(0, minutes)

    total = 0
    daily: dict[str, int] = {}
    cur = start
    while cur <= end:
        dow = cur.weekday()  # 0=Mon
        if dow in by_dow:
            total += by_dow[dow]
            daily[cur.isoformat()] = by_dow[dow]
        cur += timedelta(days=1)
    return total, daily


def compute_estimate(
    db: Session,
    employee_id: int,
    period_start: date,
    period_end: date,
    include_shift: "ExtraShift | None" = None,
) -> dict[str, Any]:
    """기간 내 예상 급여 계산.

    include_shift 가 주어지면 아직 confirmed(work_record) 되지 않은 매핑 상태의
    대타/추가근무를 잠정적으로 합산해 미리보기 추정치를 만든다.
    """
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise ValueError("employee_not_found")

    contract = _active_contract(db, employee_id)
    term: ContractTerm | None = contract.terms if contract else None
    hourly_wage = (term.hourly_wage if term and term.hourly_wage else 0) or 0
    tax_type = (term.tax_type if term else None) or "freelance_3_3"
    weekly_holiday_eligible = bool(term.weekly_holiday_eligible) if term else False
    weekly_hours = float(term.weekly_hours) if term and term.weekly_hours else 0.0

    base_minutes, daily_base = (
        _schedule_minutes_in_period(contract.schedules, period_start, period_end)
        if contract
        else (0, {})
    )

    # 확정된 대타/추가근무 (work_record) + 잠정 매핑(include_shift)
    records = (
        db.execute(
            select(WorkRecord).where(
                WorkRecord.employee_id == employee_id,
                WorkRecord.work_date >= period_start,
                WorkRecord.work_date <= period_end,
                WorkRecord.record_type.in_(("substitute", "overtime")),
            )
        )
        .scalars()
        .all()
    )
    # (record_type, work_date, minutes) 정규화
    extra_items: list[tuple[str, date, int]] = [
        (r.record_type, r.work_date, r.worked_minutes) for r in records
    ]
    if (
        include_shift is not None
        and include_shift.work_date is not None
        and include_shift.worked_minutes
        and period_start <= include_shift.work_date <= period_end
        and not any(r.extra_shift_id == include_shift.id for r in records)
    ):
        extra_items.append(
            (
                include_shift.shift_type,
                include_shift.work_date,
                include_shift.worked_minutes,
            )
        )

    extra_minutes = sum(m for _, _, m in extra_items)

    base_pay = round(base_minutes / 60 * hourly_wage)
    extra_pay = 0
    daily_extra: dict[str, int] = {}
    for rtype, rdate, minutes in extra_items:
        mult = OVERTIME_MULTIPLIER if rtype == "overtime" else 1.0
        pay = round(minutes / 60 * hourly_wage * mult)
        extra_pay += pay
        daily_extra[rdate.isoformat()] = daily_extra.get(rdate.isoformat(), 0) + pay

    gross_pay = base_pay + extra_pay

    weekly_holiday_pay = 0
    if weekly_holiday_eligible and hourly_wage and weekly_hours:
        weeks = max(1, ((period_end - period_start).days + 1) / 7)
        per_week = (min(weekly_hours, 40) / 40) * 8 * hourly_wage
        weekly_holiday_pay = round(per_week * weeks)

    taxable = gross_pay + weekly_holiday_pay
    rate = FREELANCE_TAX_RATE if tax_type == "freelance_3_3" else FOUR_INSURANCE_RATE
    tax_amount = round(taxable * rate)
    net_pay = taxable - tax_amount

    return {
        "employee_id": employee_id,
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "base_minutes": base_minutes,
        "extra_minutes": extra_minutes,
        "gross_pay": gross_pay,
        "weekly_holiday_pay": weekly_holiday_pay,
        "tax_amount": tax_amount,
        "net_pay": net_pay,
        "breakdown": {
            "hourly_wage": hourly_wage,
            "tax_type": tax_type,
            "tax_rate": rate,
            "base_pay": base_pay,
            "extra_pay": extra_pay,
            "daily_base_minutes": daily_base,
            "daily_extra_pay": daily_extra,
        },
    }


def current_month_bounds(today: date | None = None) -> tuple[date, date]:
    today = today or datetime.now().date()
    start = today.replace(day=1)
    if today.month == 12:
        nxt = date(today.year + 1, 1, 1)
    else:
        nxt = date(today.year, today.month + 1, 1)
    end = nxt - timedelta(days=1)
    return start, end
