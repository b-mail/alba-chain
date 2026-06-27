"""Gemini 호출 래퍼.

GEMINI_API_KEY 가 설정되어 있으면 실제 google-genai 를 호출하고,
없으면 결정적 mock 응답으로 폴백한다(데모 안정성).
"""
from __future__ import annotations

import json
import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        from google import genai

        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def generate_json(
    *,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict,
    image_bytes: bytes | None = None,
    image_mime: str | None = None,
) -> dict[str, Any]:
    """JSON 구조화 출력을 강제하여 dict 를 반환한다.

    Gemini 미설정 시 호출 측에서 mock 으로 처리하도록 RuntimeError 를 던지지 않고,
    여기서는 실제 호출만 담당한다.
    """
    from google.genai import types

    client = _get_client()

    parts: list[Any] = [user_prompt]
    if image_bytes is not None:
        parts.append(
            types.Part.from_bytes(
                data=image_bytes, mime_type=image_mime or "image/png"
            )
        )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=parts,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=response_schema,
            temperature=0.0,
        ),
    )
    text = response.text or "{}"
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning("Gemini 응답 JSON 파싱 실패: %s", text[:200])
        return {}
