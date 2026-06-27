"""급여 실시간 푸시용 인메모리 pub/sub (SSE).

프로세스 내 employee_id 별 구독자 큐를 관리한다. 단일 인스턴스 MVP 가정.
"""
from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import Any

_subscribers: dict[int, set[asyncio.Queue]] = defaultdict(set)


def subscribe(employee_id: int) -> asyncio.Queue:
    queue: asyncio.Queue = asyncio.Queue()
    _subscribers[employee_id].add(queue)
    return queue


def unsubscribe(employee_id: int, queue: asyncio.Queue) -> None:
    subs = _subscribers.get(employee_id)
    if subs and queue in subs:
        subs.discard(queue)
        if not subs:
            _subscribers.pop(employee_id, None)


def publish(employee_id: int, payload: dict[str, Any]) -> None:
    """동기 컨텍스트에서도 호출 가능하도록 안전하게 큐에 적재한다."""
    for queue in list(_subscribers.get(employee_id, set())):
        try:
            queue.put_nowait(payload)
        except asyncio.QueueFull:  # pragma: no cover
            pass
