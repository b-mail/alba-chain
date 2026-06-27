from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models.org import Employee


class WorkRecord(Base):
    """확정된 근태 기록. 급여 계산의 입력이 된다."""

    __tablename__ = "work_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False
    )
    contract_id: Mapped[int | None] = mapped_column(
        ForeignKey("labor_contracts.id", ondelete="SET NULL"), index=True
    )
    extra_shift_id: Mapped[int | None] = mapped_column(
        ForeignKey("extra_shifts.id", ondelete="SET NULL"), index=True
    )
    # scheduled | substitute | overtime
    record_type: Mapped[str] = mapped_column(String(16), nullable=False)
    work_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    end_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    worked_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    employee: Mapped[Employee] = relationship(back_populates="work_records")
