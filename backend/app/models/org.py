from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models.contract import LaborContract
    from app.models.extra_shift import ExtraShift
    from app.models.work_record import WorkRecord


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    representative: Mapped[str | None] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(String(512))

    employees: Mapped[list[Employee]] = relationship(
        back_populates="store", cascade="all, delete-orphan"
    )
    contracts: Mapped[list[LaborContract]] = relationship(back_populates="store")


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))

    store: Mapped[Store] = relationship(back_populates="employees")
    contracts: Mapped[list[LaborContract]] = relationship(back_populates="employee")
    extra_shifts: Mapped[list[ExtraShift]] = relationship(back_populates="employee")
    work_records: Mapped[list[WorkRecord]] = relationship(back_populates="employee")
