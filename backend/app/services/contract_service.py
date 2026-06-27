"""추출 결과(extraction_schema) → 정형 ContractTermsInput 변환 및 확정 처리."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    ContractTerm,
    Employee,
    LaborContract,
    OntologyNode,
    WorkSchedule,
)

_DAY_INDEX = {"월": 0, "화": 1, "수": 2, "목": 3, "금": 4, "토": 5, "일": 6}


def assign_employee(db: Session, contract: LaborContract, employee_id: int) -> None:
    """계약에 직원을 연결한다(같은 매장 소속 검증).

    급여(pay_service)·매핑(mapping_service)은 contract.employee_id 로 계약을
    조회하므로, 이 연결이 없으면 기본급·매핑 후보가 0이 된다.
    """
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise ValueError("employee_not_found")
    if employee.store_id != contract.store_id:
        raise ValueError("employee_store_mismatch")
    contract.employee_id = employee.id
    db.add(contract)


def resolve_or_create_employee_by_phone(
    db: Session, store_id: int, phone: str, name: str | None = None
) -> Employee:
    """매장 내 전화번호로 직원을 찾고 없으면 생성한다.

    UF2(신규 알바 등록)에서 계약서를 전송할 때 알바의 신원이 전화번호로
    처음 확정되므로, 이 시점에 직원 레코드를 만들어 계약과 연결한다.
    """
    normalized = phone.strip()
    employee = db.execute(
        select(Employee).where(
            Employee.store_id == store_id, Employee.phone == normalized
        )
    ).scalar_one_or_none()
    if employee is None:
        employee = Employee(
            store_id=store_id, name=name or normalized, phone=normalized
        )
        db.add(employee)
        db.flush()
    return employee


def _parse_days_note(note: str | None) -> list[int]:
    if not note:
        return []
    # "매주 5일", "매월 10일" 등 날짜/횟수 토큰을 제거해 '일/월' 요일 오인을 막는다.
    cleaned = re.sub(r"매주|매월|\d+\s*일|\d+\s*월", " ", note)
    seen: list[int] = []
    for ch in cleaned:
        if ch in _DAY_INDEX and _DAY_INDEX[ch] not in seen:
            seen.append(_DAY_INDEX[ch])
    return sorted(seen)


def _time_to_minutes(value: str | None) -> int | None:
    if not value:
        return None
    try:
        h, m = value.split(":")
        return int(h) * 60 + int(m)
    except ValueError:
        return None


def _daily_minutes(extracted: dict[str, Any]) -> int:
    start = _time_to_minutes(extracted.get("work_start_time"))
    end = _time_to_minutes(extracted.get("work_end_time"))
    if start is None or end is None:
        return 0
    work = end - start
    if work <= 0:  # 야간 근무(예: 22:00~06:00) → 익일로 보정
        work += 24 * 60
    bstart = _time_to_minutes(extracted.get("break_start_time"))
    bend = _time_to_minutes(extracted.get("break_end_time"))
    if bstart is not None and bend is not None:
        bmin = bend - bstart
        if bmin < 0:
            bmin += 24 * 60
        work -= max(0, bmin)
    return max(0, work)


def _break_minutes(extracted: dict[str, Any]) -> int:
    bstart = _time_to_minutes(extracted.get("break_start_time"))
    bend = _time_to_minutes(extracted.get("break_end_time"))
    if bstart is not None and bend is not None:
        bmin = bend - bstart
        if bmin < 0:
            bmin += 24 * 60
        return max(0, bmin)
    return 0


def normalize_terms(extracted: dict[str, Any]) -> dict[str, Any]:
    """extraction_schema 형태 → openapi ContractTermsInput 형태."""
    days = _parse_days_note(extracted.get("work_days_note"))
    days_per_week = extracted.get("work_days_per_week") or (len(days) if days else 0)
    daily_min = _daily_minutes(extracted)
    weekly_hours = round((daily_min * days_per_week) / 60, 2) if daily_min else 0.0

    # 주휴 판정(가이드 후처리 ②): 주 소정근로 15시간 이상
    weekly_holiday_eligible = weekly_hours >= 15

    # 세금 유형: 4대보험 미가입이면 프리랜서 3.3% 로 간주
    has_insurance = any(
        extracted.get(k)
        for k in (
            "insurance_employment",
            "insurance_industrial",
            "insurance_pension",
            "insurance_health",
        )
    )
    tax_type = "four_insurance" if has_insurance else "freelance_3_3"

    hourly_wage = None
    if extracted.get("wage_type") == "시간급":
        hourly_wage = extracted.get("wage_amount")

    schedules: list[dict[str, Any]] = []
    if days and extracted.get("work_start_time") and extracted.get("work_end_time"):
        for dow in days:
            schedules.append(
                {
                    "day_of_week": dow,
                    "start_time": extracted["work_start_time"],
                    "end_time": extracted["work_end_time"],
                    "break_minutes": _break_minutes(extracted),
                }
            )

    return {
        "hourly_wage": hourly_wage,
        "weekly_hours": weekly_hours,
        "work_start_date": extracted.get("contract_start_date"),
        "work_end_date": extracted.get("contract_end_date"),
        "pay_day": extracted.get("pay_day"),
        "tax_type": tax_type,
        "weekly_holiday_eligible": weekly_holiday_eligible,
        "schedules": schedules,
    }


def apply_terms(db: Session, contract: LaborContract, terms: dict[str, Any]) -> None:
    """ContractTermsInput 형태의 terms 를 정형 테이블에 반영한다(확정/수정)."""
    # 기존 term/schedule/ontology 제거 후 재생성
    if contract.terms:
        db.delete(contract.terms)
    for sched in list(contract.schedules):
        db.delete(sched)
    for node in list(contract.ontology_nodes):
        db.delete(node)
    db.flush()

    start = terms.get("work_start_date")
    end = terms.get("work_end_date")
    term_row = ContractTerm(
        contract_id=contract.id,
        hourly_wage=terms.get("hourly_wage"),
        weekly_hours=terms.get("weekly_hours"),
        work_start_date=_to_date(start),
        work_end_date=_to_date(end),
        pay_day=terms.get("pay_day"),
        tax_type=terms.get("tax_type"),
        weekly_holiday_eligible=bool(terms.get("weekly_holiday_eligible")),
    )
    db.add(term_row)

    for sched in terms.get("schedules", []):
        db.add(
            WorkSchedule(
                contract_id=contract.id,
                day_of_week=sched["day_of_week"],
                start_time=sched["start_time"],
                end_time=sched["end_time"],
                break_minutes=sched.get("break_minutes", 0),
            )
        )

    _build_ontology(db, contract, terms)


def _build_ontology(db: Session, contract: LaborContract, terms: dict[str, Any]) -> None:
    """[근로계약 - 업무 - 근태 - 급여] 경량 온톨로지 노드 생성."""
    contract_node = OntologyNode(
        contract_id=contract.id,
        node_type="contract",
        label=f"근로계약 #{contract.id}",
        payload={"tax_type": terms.get("tax_type")},
    )
    db.add(contract_node)
    db.flush()

    for node_type, label in (
        ("work", "업무"),
        ("attendance", "근태"),
        ("pay", "급여"),
    ):
        db.add(
            OntologyNode(
                contract_id=contract.id,
                node_type=node_type,
                label=label,
                parent_id=contract_node.id,
                payload={},
            )
        )


def _to_date(value: Any):
    if value in (None, ""):
        return None
    if hasattr(value, "isoformat") and not isinstance(value, str):
        return value
    try:
        return datetime.fromisoformat(str(value)).date()
    except ValueError:
        pass
    # "YYYY년 MM월 DD일" 등 비ISO 폴백
    m = re.search(r"(\d{4})\D+(\d{1,2})\D+(\d{1,2})", str(value))
    if m:
        y, mo, d = (int(x) for x in m.groups())
        try:
            return datetime(y, mo, d).date()
        except ValueError:
            return None
    return None
