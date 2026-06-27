"""ORM → Pydantic 스키마 직렬화 헬퍼."""
from __future__ import annotations

from app.models import ExtraShift as ExtraShiftModel
from app.models import LaborContract
from app.schemas import Contract, ExtraShift, MappingCandidate, VlmExtraction
from app.schemas.contract import ContractTermsInput, WorkScheduleInput


def serialize_contract(contract: LaborContract) -> Contract:
    terms = None
    if contract.terms is not None:
        t = contract.terms
        terms = ContractTermsInput(
            hourly_wage=t.hourly_wage,
            weekly_hours=float(t.weekly_hours) if t.weekly_hours is not None else None,
            work_start_date=t.work_start_date,
            work_end_date=t.work_end_date,
            pay_day=t.pay_day,
            tax_type=t.tax_type,
            weekly_holiday_eligible=t.weekly_holiday_eligible,
            schedules=[
                WorkScheduleInput(
                    day_of_week=s.day_of_week,
                    start_time=s.start_time,
                    end_time=s.end_time,
                    break_minutes=s.break_minutes,
                )
                for s in sorted(contract.schedules, key=lambda x: x.day_of_week)
            ],
        )
    return Contract(
        id=contract.id,
        store_id=contract.store_id,
        employee_id=contract.employee_id,
        source=contract.source,
        status=contract.status,
        raw_text=contract.raw_text,
        extracted_terms=contract.extracted_terms,
        terms=terms,
        created_at=contract.created_at,
    )


def serialize_extra_shift(
    shift: ExtraShiftModel,
    mapping_candidates: list[dict] | None = None,
) -> ExtraShift:
    vlm = None
    if shift.vlm_extraction:
        vlm = VlmExtraction(**shift.vlm_extraction)
    return ExtraShift(
        id=shift.id,
        store_id=shift.store_id,
        employee_id=shift.employee_id,
        shift_type=shift.shift_type,
        status=shift.status,
        mapped_contract_id=shift.mapped_contract_id,
        mapped_node_id=shift.mapped_node_id,
        work_date=shift.work_date,
        start_at=shift.start_at,
        end_at=shift.end_at,
        worked_minutes=shift.worked_minutes,
        interpreted_context=shift.interpreted_context,
        confidence=float(shift.confidence) if shift.confidence is not None else None,
        reject_reason=shift.reject_reason,
        vlm_extraction=vlm,
        mapping_candidates=[
            MappingCandidate(**c) for c in (mapping_candidates or [])
        ],
    )
