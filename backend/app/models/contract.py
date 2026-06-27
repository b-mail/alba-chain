from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models.org import Employee, Store


class LaborContract(Base):
    __tablename__ = "labor_contracts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), index=True, nullable=False
    )
    employee_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id", ondelete="SET NULL"), index=True
    )
    # uploaded | generated
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    # draft|parsing|extracted|pending_signature|active|expired|failed
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="draft", index=True
    )
    raw_text: Mapped[str | None] = mapped_column(Text)
    # Gemini 추출 원본(extraction_schema.json 형태)
    extracted_terms: Mapped[dict[str, Any] | None] = mapped_column(JSONB)

    store: Mapped[Store] = relationship(back_populates="contracts")
    employee: Mapped[Employee | None] = relationship(back_populates="contracts")
    terms: Mapped[ContractTerm | None] = relationship(
        back_populates="contract", uselist=False, cascade="all, delete-orphan"
    )
    schedules: Mapped[list[WorkSchedule]] = relationship(
        back_populates="contract", cascade="all, delete-orphan"
    )
    documents: Mapped[list[ContractDocument]] = relationship(
        back_populates="contract", cascade="all, delete-orphan"
    )
    ontology_nodes: Mapped[list[OntologyNode]] = relationship(
        back_populates="contract", cascade="all, delete-orphan"
    )


class ContractTerm(Base):
    """confirm 시 정형화된 근로조건 (openapi ContractTermsInput 정규화 결과)."""

    __tablename__ = "contract_terms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    contract_id: Mapped[int] = mapped_column(
        ForeignKey("labor_contracts.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    hourly_wage: Mapped[int | None] = mapped_column(Integer)
    weekly_hours: Mapped[float | None] = mapped_column(Numeric(5, 2))
    work_start_date: Mapped[date | None] = mapped_column(Date)
    work_end_date: Mapped[date | None] = mapped_column(Date)
    pay_day: Mapped[int | None] = mapped_column(Integer)
    tax_type: Mapped[str | None] = mapped_column(String(32))
    weekly_holiday_eligible: Mapped[bool] = mapped_column(Boolean, default=False)

    contract: Mapped[LaborContract] = relationship(back_populates="terms")


class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    contract_id: Mapped[int] = mapped_column(
        ForeignKey("labor_contracts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Mon..6=Sun
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # HH:MM
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)
    break_minutes: Mapped[int] = mapped_column(Integer, default=0)

    contract: Mapped[LaborContract] = relationship(back_populates="schedules")


class OntologyNode(Base):
    """[근로계약-업무-근태-급여] 연결 노드. MVP는 경량 구조."""

    __tablename__ = "ontology_nodes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    contract_id: Mapped[int] = mapped_column(
        ForeignKey("labor_contracts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    # contract | work | attendance | pay
    node_type: Mapped[str] = mapped_column(String(32), nullable=False)
    label: Mapped[str | None] = mapped_column(String(255))
    payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("ontology_nodes.id", ondelete="CASCADE")
    )

    contract: Mapped[LaborContract] = relationship(back_populates="ontology_nodes")


class ContractDocument(Base):
    __tablename__ = "contract_documents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    contract_id: Mapped[int] = mapped_column(
        ForeignKey("labor_contracts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    # original_pdf | ocr_txt | generated_pdf
    doc_type: Mapped[str] = mapped_column(String(32), nullable=False)
    file_url: Mapped[str] = mapped_column(String(512), nullable=False)

    contract: Mapped[LaborContract] = relationship(back_populates="documents")
