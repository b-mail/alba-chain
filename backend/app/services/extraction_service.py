"""근로계약 추출 서비스.

contracts/upload(pdf->txt) 와 contracts/draft(줄글) 공용.
1) Gemini(or mock) 로 원시 추출
2) jsonschema 검증
3) 후처리(enum 정규화 / extra_pay 정합성 / PII 마스킹)
"""
from __future__ import annotations

import logging
import re
from typing import Any

from jsonschema import Draft202012Validator

from app.core.config import settings
from app.services import gemini_client
from app.services.extraction_spec import (
    CONTRACT_SYSTEM_PROMPT,
    CONTRACT_USER_PROMPT_TEMPLATE,
    EXTRACTION_JSON_SCHEMA,
    GEMINI_RESPONSE_SCHEMA,
)

logger = logging.getLogger(__name__)

_WAGE_TYPES = {"시간급", "일급", "월급"}
_PAY_CYCLES = {"매월", "매주"}
_INSURANCE_KEYS = (
    "insurance_employment",
    "insurance_industrial",
    "insurance_pension",
    "insurance_health",
)


def extract_contract_terms(raw_text: str) -> dict[str, Any]:
    """줄글/OCR 텍스트에서 표준계약 조건을 추출하고 후처리한다."""
    if settings.gemini_enabled:
        try:
            raw = gemini_client.generate_json(
                system_prompt=CONTRACT_SYSTEM_PROMPT,
                user_prompt=CONTRACT_USER_PROMPT_TEMPLATE.format(raw_text=raw_text),
                response_schema=GEMINI_RESPONSE_SCHEMA,
            )
        except Exception as exc:  # noqa: BLE001  데모 안정성 위해 폴백
            logger.warning("Gemini 추출 실패, mock 폴백: %s", exc)
            raw = _mock_extract(raw_text)
    else:
        raw = _mock_extract(raw_text)

    return postprocess(raw)


def postprocess(raw: dict[str, Any]) -> dict[str, Any]:
    """가이드의 서버 후처리 규칙을 적용한다."""
    data = dict(raw)

    # 보험 4종 기본값 보정
    for key in _INSURANCE_KEYS:
        data[key] = bool(data.get(key) or False)

    # confidence 기본값
    if data.get("confidence") is None:
        data["confidence"] = 0.5

    # enum 정규화: 범위 밖이면 null + 검수 플래그
    review_flags: list[str] = []
    if data.get("wage_type") not in _WAGE_TYPES:
        if data.get("wage_type") is not None:
            review_flags.append("wage_type")
        data["wage_type"] = None
    if data.get("pay_cycle") not in _PAY_CYCLES:
        if data.get("pay_cycle") is not None:
            review_flags.append("pay_cycle")
        data["pay_cycle"] = None

    # extra_pay 정합성: exists=false 인데 금액 있으면 exists=true 보정
    if not data.get("extra_pay_exists") and data.get("extra_pay_amount"):
        data["extra_pay_exists"] = True

    # 날짜 정규화: 모델이 "YYYY년 MM월 DD일" 로 줘도 ISO(YYYY-MM-DD)로 통일
    for key in ("contract_start_date", "contract_end_date", "contract_date"):
        if data.get(key):
            data[key] = _normalize_date(data[key])

    # PII: 주민등록번호 뒤 6자리 마스킹
    rid = data.get("eul_resident_id")
    if rid:
        data["eul_resident_id"] = _mask_resident_id(rid)

    if review_flags:
        data["_review_flags"] = review_flags

    _validate(data)
    return data


def _validate(data: dict[str, Any]) -> None:
    """jsonschema 검증. 실패해도 차단하지 않고 경고만 남긴다(검수 우선)."""
    validator = Draft202012Validator(EXTRACTION_JSON_SCHEMA)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
    if errors:
        msgs = [f"{list(e.path)}: {e.message}" for e in errors[:5]]
        logger.warning("추출 결과 스키마 위반: %s", msgs)


def _normalize_date(value: Any) -> Any:
    """'2026년 07월 01일' / '2026.07.01' / '2026-7-1' → '2026-07-01'."""
    if not isinstance(value, str):
        return value
    m = re.search(r"(\d{4})\D+(\d{1,2})\D+(\d{1,2})", value)
    if m:
        y, mo, d = (int(x) for x in m.groups())
        return f"{y:04d}-{mo:02d}-{d:02d}"
    return value


def _mask_resident_id(rid: str) -> str:
    m = re.match(r"^(\d{6})[-\s]?(\d)\d*$", rid.strip())
    if m:
        return f"{m.group(1)}-{m.group(2)}******"
    return rid


_DAY_MAP = {"월": 0, "화": 1, "수": 2, "목": 3, "금": 4, "토": 5, "일": 6}
_INV_DAY = {v: k for k, v in _DAY_MAP.items()}


def _mock_extract(raw_text: str) -> dict[str, Any]:
    """GEMINI_API_KEY 미설정/실패 시 결정적 규칙 기반 추출(데모/오프라인용).

    표준근로계약서(표 기반) 형식과 자유 줄글을 모두 정규식으로 파싱한다.
    """
    text = raw_text or ""

    return {
        "gap_company_name": _re1(text, r"사업체명\s*[:：]?\s*([^\n|]+)"),
        "eul_name": _eul_name(text),
        "contract_start_date": _contract_date(text, start=True),
        "contract_end_date": _contract_date(text, start=False),
        "workplace": _re1(text, r"근무\s*장소\s*\|?\s*([^\n|]+)"),
        "job_description": _re1(text, r"업무\s*내용\s*\|?\s*([^\n|]+)"),
        "work_days_per_week": _work_days(text)[0],
        "work_days_note": _work_days(text)[1],
        "work_start_time": _time_range(text, r"근로시간")[0] or _loose_time(text)[0],
        "work_end_time": _time_range(text, r"근로시간")[1] or _loose_time(text)[1],
        "break_start_time": _time_range(text, r"휴게시간")[0],
        "break_end_time": _time_range(text, r"휴게시간")[1],
        "weekly_holiday_day": _weekly_holiday(text),
        "wage_type": _wage(text)[0],
        "wage_amount": _wage(text)[1],
        "extra_pay_exists": False,
        "extra_pay_amount": None,
        "extra_pay_detail": None,
        "overtime_rate_pct": _overtime_rate(text),
        "overtime_rate_detail": None,
        "pay_day": _pay_day(text),
        "pay_cycle": _pay_cycle(text),
        "pay_method": "예금통장 입금" if "통장" in text else None,
        # 표 텍스트에서 체크표시를 신뢰성 있게 추출할 수 없어 기본 false.
        "insurance_employment": False,
        "insurance_industrial": False,
        "insurance_pension": False,
        "insurance_health": False,
        "contract_date": None,
        "gap_business_name": _re1(text, r"사업체명\s*[:：]?\s*([^\n|]+)"),
        "gap_representative": _re1(text, r"대표자명\s*[:：]?\s*([^\n|(]+)"),
        "gap_address": None,
        "eul_address": _re1(text, r"\(을\)\s*주소\s*[:：]?\s*([^\n|]+)"),
        "eul_full_name": _eul_name(text),
        "eul_resident_id": _re1(text, r"주민등록번호\s*[:：]?\s*(\d{6}-?\d[\d*]+)"),
        "confidence": 0.55,
    }


def _re1(text: str, pattern: str) -> str | None:
    m = re.search(pattern, text)
    if m:
        val = m.group(1).strip()
        return val or None
    return None


def _eul_name(text: str) -> str | None:
    m = re.search(r"성명\s*[:：]?\s*([가-힣]{2,4})", text)
    if m:
        return m.group(1)
    m = re.search(r"([가-힣]{2,4})\s*(?:시급|시간급|님|씨)", text)
    return m.group(1) if m else None


def _contract_date(text: str, *, start: bool) -> str | None:
    m = re.search(
        r"근로계약기간\s*\|?\s*(\d{4})\D+(\d{1,2})\D+(\d{1,2})\D+~\D*"
        r"(\d{4})\D+(\d{1,2})\D+(\d{1,2})",
        text,
    )
    if not m:
        return None
    g = m.groups()
    y, mo, d = (g[0], g[1], g[2]) if start else (g[3], g[4], g[5])
    return f"{int(y):04d}-{int(mo):02d}-{int(d):02d}"


def _work_days(text: str) -> tuple[int | None, str | None]:
    m = re.search(r"매주\s*(\d+)\s*일\s*\(([^)]*)\)", text)
    if m:
        count = int(m.group(1))
        days = [c for c in m.group(2) if c in _DAY_MAP]
        note = "".join(days) if days else None
        return count, note
    return None, None


def _time_range(text: str, label: str) -> tuple[str | None, str | None]:
    m = re.search(
        label + r"\s*\|?\s*(\d{1,2})\s*시\s*(\d{1,2})\s*분\s*~\s*"
        r"(\d{1,2})\s*시\s*(\d{1,2})\s*분",
        text,
    )
    if not m:
        return None, None
    sh, sm, eh, em = (int(x) for x in m.groups())
    return f"{sh:02d}:{sm:02d}", f"{eh:02d}:{em:02d}"


def _loose_time(text: str) -> tuple[str | None, str | None]:
    m = re.search(r"(\d{1,2})\s*시\s*[~\-]\s*(\d{1,2})\s*시", text)
    if not m:
        return None, None
    return f"{int(m.group(1)):02d}:00", f"{int(m.group(2)):02d}:00"


def _weekly_holiday(text: str) -> str | None:
    m = re.search(r"주휴일\s*매주\s*([월화수목금토일])\s*요일", text)
    if m:
        return f"{m.group(1)}요일"
    return None


def _wage(text: str) -> tuple[str | None, int | None]:
    m = re.search(r"(시간급|일급|월급|시급)\s*[:：]?\s*([\d,]+)\s*원", text)
    if m:
        wtype = "시간급" if m.group(1) == "시급" else m.group(1)
        return wtype, int(m.group(2).replace(",", ""))
    return None, None


def _overtime_rate(text: str) -> int | None:
    m = re.search(r"가산임금률[^\n]*?(\d{1,3})\s*%", text)
    if m:
        return int(m.group(1))
    if "가산" in text or "연장" in text:
        return 50
    return None


def _pay_day(text: str) -> int | None:
    m = re.search(r"임금지급일\s*[:：]?\s*(?:매월|매주)?\s*(\d{1,2})\s*일", text)
    if m:
        return int(m.group(1))
    m = re.search(r"매월\s*(\d{1,2})\s*일", text)
    return int(m.group(1)) if m else None


def _pay_cycle(text: str) -> str | None:
    if re.search(r"임금지급일\s*[:：]?\s*매주", text):
        return "매주"
    if "매월" in text:
        return "매월"
    return None
