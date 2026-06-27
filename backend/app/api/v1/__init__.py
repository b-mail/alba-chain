from fastapi import APIRouter

from app.api.v1.contracts import router as contracts_router
from app.api.v1.extra_shifts import router as extra_shifts_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.pay import router as pay_router

api_router = APIRouter()
api_router.include_router(contracts_router)
api_router.include_router(jobs_router)
api_router.include_router(extra_shifts_router)
api_router.include_router(pay_router)
