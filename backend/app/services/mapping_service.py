"""대타/추가근무 → 기존 근로계약 온톨로지 노드 매핑 후보 생성.

직원의 '조건이 확정된(terms 존재)' 근로계약을 후보로 삼아, 해석된 근무일/시간과의
적합도를 점수화한다. 사장은 후보 중 하나를 골라 강제 매핑한다.
"""
from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ContractTerm, ExtraShift, LaborContract, OntologyNode

_DOW_KO = ["월", "화", "수", "목", "금", "토", "일"]


def suggest_candidates(db: Session, shift: ExtraShift) -> list[dict[str, Any]]:
    """매핑 후보 목록(점수 내림차순)을 반환한다."""
    contracts = (
        db.execute(
            select(LaborContract)
            .join(ContractTerm, ContractTerm.contract_id == LaborContract.id)
            .where(LaborContract.employee_id == shift.employee_id)
            .order_by(LaborContract.created_at.desc())
        )
        .scalars()
        .all()
    )
    if not contracts:
        return []

    work_date: date | None = shift.work_date or (
        shift.start_at.date() if shift.start_at else None
    )

    candidates: list[dict[str, Any]] = []
    for contract in contracts:
        score = 0.5
        reasons: list[str] = ["조건이 확정된 근로계약"]

        sched_days = {s.day_of_week for s in contract.schedules}
        if work_date is not None and work_date.weekday() in sched_days:
            score += 0.4
            reasons.append(f"근무일({_DOW_KO[work_date.weekday()]})이 계약 스케줄과 일치")
        elif work_date is not None and sched_days:
            reasons.append("계약 스케줄과 다른 요일(대타 가능성)")

        if contract.status == "active":
            score += 0.1
            reasons.append("활성 계약")

        score = min(round(score, 2), 1.0)

        # 매핑 대상 온톨로지 노드: 근태(attendance) 노드 우선
        node = next(
            (n for n in contract.ontology_nodes if n.node_type == "attendance"), None
        )

        store_name = contract.store.name if contract.store else "매장"
        hw = contract.terms.hourly_wage if contract.terms else None
        label = f"{store_name} · 시급 {hw:,}원" if hw else store_name

        candidates.append(
            {
                "contract_id": contract.id,
                "node_id": node.id if node else None,
                "label": label,
                "score": score,
                "reason": ", ".join(reasons),
                "suggested_start_at": shift.start_at.isoformat()
                if shift.start_at
                else None,
                "suggested_end_at": shift.end_at.isoformat()
                if shift.end_at
                else None,
            }
        )

    candidates.sort(key=lambda c: c["score"], reverse=True)
    return candidates


def default_attendance_node(db: Session, contract_id: int) -> int | None:
    """계약의 근태 온톨로지 노드 id 를 반환(없으면 None)."""
    node = db.execute(
        select(OntologyNode).where(
            OntologyNode.contract_id == contract_id,
            OntologyNode.node_type == "attendance",
        )
    ).scalar_one_or_none()
    return node.id if node else None
