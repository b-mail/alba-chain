"""대타/추가근무 증빙 해석 서비스 (Gemini Vision + mock 폴백)."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from app.core.config import settings
from app.services import gemini_client
from app.services.extraction_spec import VLM_RESPONSE_SCHEMA, VLM_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


def interpret_evidence(
    *,
    raw_content: str | None = None,
    image_bytes: bytes | None = None,
    image_mime: str | None = None,
    reference_date: datetime | None = None,
) -> dict[str, Any]:
    """카톡 캡처/텍스트에서 근무 사건을 해석한다."""
    ref = reference_date or datetime.now()
    user_prompt = (
        f"reference_date: {ref.isoformat()}\n\n"
        f"[증빙 텍스트]\n{raw_content or '(이미지 참조)'}"
    )

    if settings.gemini_enabled and (image_bytes or raw_content):
        try:
            raw = gemini_client.generate_json(
                system_prompt=VLM_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                response_schema=VLM_RESPONSE_SCHEMA,
                image_bytes=image_bytes,
                image_mime=image_mime,
            )
            return _normalize(raw)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Gemini VLM 해석 실패, mock 폴백: %s", exc)

    return _mock_interpret(raw_content, ref)


def _normalize(raw: dict[str, Any]) -> dict[str, Any]:
    start = _parse_dt(raw.get("start"))
    end = _parse_dt(raw.get("end"))
    duration = raw.get("duration_minutes")
    if duration is None and start and end:
        duration = int((end - start).total_seconds() // 60)
    return {
        "event": raw.get("event"),
        "requested_by": raw.get("requested_by"),
        "start": start.isoformat() if start else None,
        "end": end.isoformat() if end else None,
        "duration_minutes": duration,
        "confidence": raw.get("confidence", 0.5),
    }


def _parse_dt(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _mock_interpret(raw_content: str | None, ref: datetime) -> dict[str, Any]:
    """API 키 미설정 시 결정적 해석. 기본 4시간 대타로 가정."""
    text = raw_content or ""
    start = ref.replace(hour=18, minute=0, second=0, microsecond=0)
    end = start + timedelta(hours=4)
    requested_by = "사장님" if "사장" in text else "점장"
    return {
        "event": "추가근무/대타 요청 (mock 해석)",
        "requested_by": requested_by,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "duration_minutes": 240,
        "confidence": 0.3,
    }
