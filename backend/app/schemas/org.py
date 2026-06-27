from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class StoreCreate(BaseModel):
    name: str
    representative: str | None = None
    address: str | None = None


class Store(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    representative: str | None = None
    address: str | None = None


class EmployeeCreate(BaseModel):
    store_id: int
    name: str
    phone: str | None = None


class EmployeeUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None


class Employee(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: int
    name: str
    phone: str | None = None
