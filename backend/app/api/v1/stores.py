from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.serializers import serialize_contract, serialize_extra_shift
from app.core.db import get_db
from app.models import Employee as EmployeeModel
from app.models import ExtraShift as ExtraShiftModel
from app.models import LaborContract
from app.models import Store as StoreModel
from app.schemas import Contract, Employee, ExtraShift, Store, StoreCreate

router = APIRouter(prefix="/stores", tags=["stores"])


def _get_store_or_404(db: Session, store_id: int) -> StoreModel:
    store = db.get(StoreModel, store_id)
    if store is None:
        raise HTTPException(status_code=404, detail="store_not_found")
    return store


@router.post("", status_code=201, response_model=Store)
def create_store(payload: StoreCreate, db: Session = Depends(get_db)) -> Store:
    store = StoreModel(
        name=payload.name,
        representative=payload.representative,
        address=payload.address,
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    return Store.model_validate(store)


@router.get("/{id}", response_model=Store)
def get_store(id: int, db: Session = Depends(get_db)) -> Store:
    return Store.model_validate(_get_store_or_404(db, id))


@router.get("/{id}/employees", response_model=list[Employee])
def list_store_employees(id: int, db: Session = Depends(get_db)) -> list[Employee]:
    _get_store_or_404(db, id)
    rows = (
        db.execute(
            select(EmployeeModel)
            .where(EmployeeModel.store_id == id)
            .order_by(EmployeeModel.id)
        )
        .scalars()
        .all()
    )
    return [Employee.model_validate(r) for r in rows]


@router.get("/{id}/contracts", response_model=list[Contract])
def list_store_contracts(id: int, db: Session = Depends(get_db)) -> list[Contract]:
    _get_store_or_404(db, id)
    rows = (
        db.execute(
            select(LaborContract)
            .where(LaborContract.store_id == id)
            .order_by(LaborContract.created_at.desc())
        )
        .scalars()
        .all()
    )
    return [serialize_contract(c) for c in rows]


@router.get("/{id}/extra-shifts", response_model=list[ExtraShift])
def list_store_extra_shifts(
    id: int,
    status: str | None = Query(
        None, description="콤마 구분 상태 필터 (예: interpreted,mapped)"
    ),
    db: Session = Depends(get_db),
) -> list[ExtraShift]:
    _get_store_or_404(db, id)
    stmt = select(ExtraShiftModel).where(ExtraShiftModel.store_id == id)
    if status:
        statuses = [s.strip() for s in status.split(",") if s.strip()]
        if statuses:
            stmt = stmt.where(ExtraShiftModel.status.in_(statuses))
    stmt = stmt.order_by(ExtraShiftModel.id.desc())
    rows = db.execute(stmt).scalars().all()
    return [serialize_extra_shift(s) for s in rows]
