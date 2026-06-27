from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models.org import Employee


class ExtraShift(Base):
    __tablename__ = "extra_shifts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    store_id: Mapped[int] = mapped_column(index=True, nullable=False)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # substitute | overtime
    shift_type: Mapped[str] = mapped_column(String(16), nullable=False)
    # evidence_uploaded | interpreting | interpreted | mapped | confirmed | rejected
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="evidence_uploaded", index=True
    )
    reject_reason: Mapped[str | None] = mapped_column(Text)
    mapped_contract_id: Mapped[int | None] = mapped_column(
        ForeignKey("labor_contracts.id", ondelete="SET NULL")
    )
    mapped_node_id: Mapped[int | None] = mapped_column(
        ForeignKey("ontology_nodes.id", ondelete="SET NULL")
    )
    work_date: Mapped[date | None] = mapped_column(Date)
    start_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    end_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    worked_minutes: Mapped[int | None] = mapped_column(Integer)
    interpreted_context: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Numeric(3, 2))
    vlm_extraction: Mapped[dict[str, Any] | None] = mapped_column(JSONB)

    employee: Mapped[Employee] = relationship(back_populates="extra_shifts")
    evidences: Mapped[list[Evidence]] = relationship(
        back_populates="extra_shift", cascade="all, delete-orphan"
    )


class Evidence(Base):
    __tablename__ = "evidences"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    extra_shift_id: Mapped[int] = mapped_column(
        ForeignKey("extra_shifts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # kakaotalk_image | text
    evidence_type: Mapped[str] = mapped_column(String(32), nullable=False)
    file_url: Mapped[str | None] = mapped_column(String(512))
    raw_content: Mapped[str | None] = mapped_column(Text)

    extra_shift: Mapped[ExtraShift] = relationship(back_populates="evidences")
