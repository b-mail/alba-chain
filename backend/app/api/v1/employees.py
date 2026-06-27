from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import Employee as EmployeeModel
from app.models import Store as StoreModel
from app.models import WorkRecord as WorkRecordModel
from app.schemas import Employee, EmployeeCreate, EmployeeUpdate, WorkRecord

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("", status_code=201, response_model=Employee)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)) -> Employee:
    if db.get(StoreModel, payload.store_id) is None:
        raise HTTPException(status_code=404, detail="store_not_found")
    emp = EmployeeModel(
        store_id=payload.store_id, name=payload.name, phone=payload.phone
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return Employee.model_validate(emp)


@router.patch("/{id}", response_model=Employee)
def update_employee(
    id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)
) -> Employee:
    emp = db.get(EmployeeModel, id)
    if emp is None:
        raise HTTPException(status_code=404, detail="employee_not_found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("name") is not None:
        emp.name = data["name"]
    if "phone" in data:
        emp.phone = data["phone"]
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return Employee.model_validate(emp)


@router.get("/{id}/work-records", response_model=list[WorkRecord])
def list_employee_work_records(
    id: int,
    from_: date | None = Query(None, alias="from"),
    to: date | None = Query(None),
    db: Session = Depends(get_db),
) -> list[WorkRecord]:
    if db.get(EmployeeModel, id) is None:
        raise HTTPException(status_code=404, detail="employee_not_found")
    stmt = select(WorkRecordModel).where(WorkRecordModel.employee_id == id)
    if from_ is not None:
        stmt = stmt.where(WorkRecordModel.work_date >= from_)
    if to is not None:
        stmt = stmt.where(WorkRecordModel.work_date <= to)
    stmt = stmt.order_by(
        WorkRecordModel.work_date.desc(), WorkRecordModel.id.desc()
    )
    rows = db.execute(stmt).scalars().all()
    return [WorkRecord.model_validate(r) for r in rows]
