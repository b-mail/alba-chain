from __future__ import annotations

import asyncio
import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app.core.db import SessionLocal, get_db
from app.schemas import PayEstimate
from app.services import pay_service, pubsub

router = APIRouter(prefix="/employees", tags=["pay"])


@router.get("/{id}/pay-estimate", response_model=PayEstimate)
def get_pay_estimate(
    id: int,
    from_: date = Query(..., alias="from"),
    to: date = Query(...),
    db: Session = Depends(get_db),
) -> PayEstimate:
    try:
        estimate = pay_service.compute_estimate(db, id, from_, to)
    except ValueError:
        raise HTTPException(status_code=404, detail="employee_not_found")
    return PayEstimate(**estimate)


@router.get("/{id}/pay-estimate/stream")
async def stream_pay_estimate(id: int, request: Request) -> EventSourceResponse:
    """예상 급여 실시간 푸시 (SSE). 매핑·승인 시 갱신된 PayEstimate 를 push."""

    async def event_generator():
        # 최초 1회 현재 추정치 전송
        db = SessionLocal()
        try:
            start, end = pay_service.current_month_bounds()
            try:
                initial = pay_service.compute_estimate(db, id, start, end)
                yield {"event": "pay_estimate", "data": json.dumps(initial)}
            except ValueError:
                yield {
                    "event": "error",
                    "data": json.dumps({"code": "employee_not_found"}),
                }
                return
        finally:
            db.close()

        queue = pubsub.subscribe(id)
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield {"event": "pay_estimate", "data": json.dumps(payload)}
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": "{}"}
        finally:
            pubsub.unsubscribe(id, queue)

    return EventSourceResponse(event_generator())
