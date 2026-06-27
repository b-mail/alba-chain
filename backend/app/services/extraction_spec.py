"""계약 추출용 JSON Schema / 프롬프트.

contract_extraction_guide.md 를 그대로 코드화한다. 추출기는 contracts/upload(pdf->txt)
와 contracts/draft(줄글) 가 공용으로 사용한다.
"""
from __future__ import annotations

# contract_extraction_guide.md 의 출력 JSON Schema (draft 2020-12)
EXTRACTION_JSON_SCHEMA: dict = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "StandardContractExtraction",
    "type": "object",
    "additionalProperties": False,
    "required": [
        "wage_type",
        "wage_amount",
        "insurance_employment",
        "insurance_industrial",
        "insurance_pension",
        "insurance_health",
        "confidence",
    ],
    "properties": {
        "gap_company_name": {"type": ["string", "null"]},
        "eul_name": {"type": ["string", "null"]},
        "contract_start_date": {"type": ["string", "null"], "format": "date"},
        "contract_end_date": {"type": ["string", "null"], "format": "date"},
        "workplace": {"type": ["string", "null"]},
        "job_description": {"type": ["string", "null"]},
        "work_days_per_week": {
            "type": ["number", "null"],
            "minimum": 0,
            "maximum": 7,
        },
        "work_days_note": {"type": ["string", "null"]},
        "work_start_time": {
            "type": ["string", "null"],
            "pattern": r"^([01]\d|2[0-3]):[0-5]\d$",
        },
        "work_end_time": {
            "type": ["string", "null"],
            "pattern": r"^([01]\d|2[0-3]):[0-5]\d$",
        },
        "break_start_time": {
            "type": ["string", "null"],
            "pattern": r"^([01]\d|2[0-3]):[0-5]\d$",
        },
        "break_end_time": {
            "type": ["string", "null"],
            "pattern": r"^([01]\d|2[0-3]):[0-5]\d$",
        },
        "weekly_holiday_day": {"type": ["string", "null"]},
        "wage_type": {
            "type": ["string", "null"],
            "enum": ["시간급", "일급", "월급", None],
        },
        "wage_amount": {"type": ["number", "null"], "minimum": 0},
        "extra_pay_exists": {"type": ["boolean", "null"]},
        "extra_pay_amount": {"type": ["number", "null"], "minimum": 0},
        "extra_pay_detail": {"type": ["string", "null"]},
        "overtime_rate_pct": {"type": ["number", "null"], "minimum": 0},
        "overtime_rate_detail": {"type": ["string", "null"]},
        "pay_day": {"type": ["number", "null"], "minimum": 1, "maximum": 31},
        "pay_cycle": {"type": ["string", "null"], "enum": ["매월", "매주", None]},
        "pay_method": {"type": ["string", "null"]},
        "insurance_employment": {"type": "boolean", "default": False},
        "insurance_industrial": {"type": "boolean", "default": False},
        "insurance_pension": {"type": "boolean", "default": False},
        "insurance_health": {"type": "boolean", "default": False},
        "contract_date": {"type": ["string", "null"], "format": "date"},
        "gap_business_name": {"type": ["string", "null"]},
        "gap_representative": {"type": ["string", "null"]},
        "gap_address": {"type": ["string", "null"]},
        "eul_address": {"type": ["string", "null"]},
        "eul_full_name": {"type": ["string", "null"]},
        "eul_resident_id": {"type": ["string", "null"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "_review_flags": {"type": "array", "items": {"type": "string"}},
    },
    "allOf": [
        {
            "if": {"properties": {"extra_pay_exists": {"const": True}}},
            "then": {"required": ["extra_pay_amount"]},
        }
    ],
}

# Gemini response_schema 는 draft 스키마의 일부 키워드(allOf/if/then, $schema 등)를
# 지원하지 않으므로, 단순화한 형태를 별도로 둔다.
GEMINI_RESPONSE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "gap_company_name": {"type": "string", "nullable": True},
        "eul_name": {"type": "string", "nullable": True},
        "contract_start_date": {"type": "string", "nullable": True},
        "contract_end_date": {"type": "string", "nullable": True},
        "workplace": {"type": "string", "nullable": True},
        "job_description": {"type": "string", "nullable": True},
        "work_days_per_week": {"type": "number", "nullable": True},
        "work_days_note": {"type": "string", "nullable": True},
        "work_start_time": {"type": "string", "nullable": True},
        "work_end_time": {"type": "string", "nullable": True},
        "break_start_time": {"type": "string", "nullable": True},
        "break_end_time": {"type": "string", "nullable": True},
        "weekly_holiday_day": {"type": "string", "nullable": True},
        "wage_type": {"type": "string", "nullable": True},
        "wage_amount": {"type": "number", "nullable": True},
        "extra_pay_exists": {"type": "boolean", "nullable": True},
        "extra_pay_amount": {"type": "number", "nullable": True},
        "extra_pay_detail": {"type": "string", "nullable": True},
        "overtime_rate_pct": {"type": "number", "nullable": True},
        "overtime_rate_detail": {"type": "string", "nullable": True},
        "pay_day": {"type": "number", "nullable": True},
        "pay_cycle": {"type": "string", "nullable": True},
        "pay_method": {"type": "string", "nullable": True},
        "insurance_employment": {"type": "boolean"},
        "insurance_industrial": {"type": "boolean"},
        "insurance_pension": {"type": "boolean"},
        "insurance_health": {"type": "boolean"},
        "contract_date": {"type": "string", "nullable": True},
        "gap_business_name": {"type": "string", "nullable": True},
        "gap_representative": {"type": "string", "nullable": True},
        "gap_address": {"type": "string", "nullable": True},
        "eul_address": {"type": "string", "nullable": True},
        "eul_full_name": {"type": "string", "nullable": True},
        "eul_resident_id": {"type": "string", "nullable": True},
        "confidence": {"type": "number"},
    },
    "required": [
        "wage_type",
        "wage_amount",
        "insurance_employment",
        "insurance_industrial",
        "insurance_pension",
        "insurance_health",
        "confidence",
    ],
}

CONTRACT_SYSTEM_PROMPT = """너는 대한민국 표준근로계약서/단시간근로계약서 텍스트에서 계약 조건을 구조화하는 추출기다.
입력 텍스트에 명시된 정보만 추출하고, 없는 값은 추측하지 말고 null 로 둔다.
출력은 아래 JSON 스키마를 만족하는 JSON 객체 하나만 출력한다. 설명·마크다운·코드펜스 금지.

용어:
- 갑(甲) = 사업주/회사 → gap_* 필드
- 을(乙) = 근로자 → eul_* 필드

필드 규칙:
- gap_company_name: 회사/매장 상호. gap_business_name 과 같을 수 있으나, 상단 당사자 표기는 company_name, 하단 서명란 사업체명은 business_name 으로 구분해 채운다. 한쪽만 있으면 있는 쪽만.
- eul_name / eul_full_name: 상단 당사자명은 eul_name, 하단 서명란 성명은 eul_full_name. 한쪽만 있으면 있는 쪽만.
- wage_type: 반드시 "시간급" | "일급" | "월급" 중 하나. 그 외/불명확은 null.
- wage_amount: wage_type 에 해당하는 금액(원, 정수).
- extra_pay_exists: 상여금·수당 등 별도 지급 항목 언급이 있으면 true, 없음 명시면 false, 불명확이면 null.
  true 일 때만 extra_pay_amount / extra_pay_detail 을 채운다.
- overtime_rate_pct: 연장·야간·휴일근로 가산율(%). "통상임금의 50% 가산"이면 50. 불명확이면 null.
- pay_cycle: "매월" | "매주" 중 하나. 그 외 null.
- pay_day: 지급일(1~31 또는 말일=31 로 표기). 요일 지급이면 pay_day=null 로 두고 pay_method 에 메모.
- pay_method: 지급방법 원문(예: "근로자 명의 예금통장 입금").
- 보험 4종(insurance_*)은 boolean 이며 null 을 쓰지 않는다. 가입/체크 표시가 있으면 true, 그 외에는 false.
- 시간 표기는 24시간 HH:MM. 휴게시간이 없으면 break_* 는 null.
- confidence(0.0~1.0) 를 항상 포함한다."""

CONTRACT_USER_PROMPT_TEMPLATE = """[근로계약 텍스트]
{raw_text}

위 텍스트에서 표준근로계약서 조건을 추출해 JSON 으로만 출력하라."""


VLM_SYSTEM_PROMPT = """너는 카카오톡 대화 캡처 이미지나 텍스트에서 '대타/추가근무 요청 사건'의 맥락과 시간을 해석하는 분석기다.
출력은 아래 JSON 객체 하나만 출력한다. 설명·마크다운·코드펜스 금지.

필드:
- event: 사건 요약 (예: "토요일 오후 대타 요청").
- requested_by: 요청한 사람 (예: "사장님", "점장").
- start: 근무 시작 일시 (ISO8601, 불명확이면 null).
- end: 근무 종료 일시 (ISO8601, 불명확이면 null).
- duration_minutes: 근무 시간(분). start/end 로 계산 가능하면 채운다. 불명확이면 null.
- confidence: 0.0~1.0 신뢰도.

날짜/시간이 상대적(예: "이번 주 토요일")이면 reference_date 를 기준으로 절대 일시로 환산한다."""

VLM_RESPONSE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "event": {"type": "string", "nullable": True},
        "requested_by": {"type": "string", "nullable": True},
        "start": {"type": "string", "nullable": True},
        "end": {"type": "string", "nullable": True},
        "duration_minutes": {"type": "integer", "nullable": True},
        "confidence": {"type": "number"},
    },
    "required": ["confidence"],
}
