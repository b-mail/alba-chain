# 알바체인 (Alba-Chain)

> 사장님에겐 대충 찍어 올리면 끝나는 매장 자동화를, 알바생에겐 캡처 한 장으로 추가 수당까지 챙겨주는
> **AI 온톨로지 기반 올인원 알바 매니지먼트 SaaS**

비정형 데이터(사진·캡처·줄글)를 VLM 으로 분석하여 **[근로계약 — 업무 — 근태 — 급여]** 를
하나의 온톨로지(지식 구조)로 연결하고 자동화한다.

## 핵심 기능

- **근로계약서 Agent** — 계약서 문서(PDF / DOCX / TXT) 업로드 파싱(UF1), 줄글 입력으로 계약 초안 생성(UF2)
- **대타/추가근무 Agent** — 카톡 캡처 등 증빙을 Gemini VLM 으로 해석 → 기존 근로계약 온톨로지 노드에 매핑 → 급여 재계산
- **급여 계산** — 주휴수당 + 세금(3.3%)을 반영한 실시간 예상 급여 (폴링 / SSE 푸시)

자세한 제품 명세는 [`srs.md`](./srs.md) 를 참고한다.

## 아키텍처

```
사용자 ──▶ FastAPI (REST + SSE) ──▶ 서비스 레이어 ──▶ PostgreSQL
                  │                       │
                  │                       └─▶ Gemini VLM (계약 추출 / 캡처 해석)
                  └─▶ BackgroundTasks + agent_jobs (비동기 잡 + 폴링)
```

비동기 작업(문서 파싱, VLM 해석)은 `202 + jobId` 로 응답하고, 폴링 또는 SSE 로 결과를 수신한다.

## 기술 스택

- Python 3.11 · FastAPI · Uvicorn
- PostgreSQL · SQLAlchemy 2.0 · Alembic
- Google Gemini (`google-genai`) — 계약 추출(structured output) + 캡처 vision 해석
- 비동기 잡: FastAPI BackgroundTasks + `agent_jobs` 상태 테이블, SSE 푸시
- 파일 저장: 로컬 `storage/`

## 빠른 시작

```bash
cd backend
cp .env.example .env            # 필요 시 GEMINI_API_KEY 설정 (없으면 mock 동작)
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

docker compose up -d            # PostgreSQL 기동
alembic upgrade head            # 스키마 마이그레이션
python -m app.seed              # (선택) 데모용 store/employee 시드

uvicorn app.main:app --reload --port 8000
```

- API 문서(Swagger UI): http://localhost:8000/docs
- 베이스 경로: `/api/v1`
- 헬스 체크: `GET /health`

## 환경 변수

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL 접속 URL | `postgresql+psycopg://alba:alba@localhost:5432/alba_chain` |
| `GEMINI_API_KEY` | Gemini API 키. 미설정 시 mock 폴백 | (없음) |
| `GEMINI_MODEL` | 사용할 모델 | `gemini-2.0-flash` |
| `STORAGE_DIR` | 파일 저장 루트 | `storage` |

## API 개요

| 메서드 & 경로 | 설명 |
| --- | --- |
| `POST /contracts/upload` | 근로계약서 문서 업로드 (UF1, 비동기 파싱) |
| `POST /contracts/draft` | 줄글 입력으로 계약 초안 생성 (UF2) |
| `GET /contracts/{id}` | 계약 상세 / 추출 결과 조회 |
| `PATCH /contracts/{id}` | 추출된 계약 조건 수정 |
| `POST /contracts/{id}/confirm` | 추출값 검증·확정 |
| `POST /contracts/{id}/generate-pdf` | 계약서 PDF 생성 |
| `POST /contracts/{id}/send` | 알바에게 계약서 전송 |
| `GET /agent-jobs/{jobId}` | Agent 잡 상태 폴링 |
| `POST /extra-shifts` | 대타/추가근무 세션 시작 |
| `POST /extra-shifts/{id}/evidences` | 증빙 업로드 → VLM 해석 잡 트리거 |
| `GET /extra-shifts/{id}` | VLM 해석 결과 + 매핑 후보 조회 |
| `PATCH /extra-shifts/{id}/mapping` | 기존 계약 노드에 강제 매핑 확정 |
| `POST /extra-shifts/{id}/reject` | 증빙/해석 반려 |
| `POST /extra-shifts/{id}/confirm` | 사장 최종 승인 → 근태 반영 + 급여 재계산 |
| `GET /employees/{id}/pay-estimate` | 실시간 예상 급여 조회 |
| `GET /employees/{id}/pay-estimate/stream` | 예상 급여 실시간 푸시 (SSE) |

전체 명세는 [`openapi.yaml`](./openapi.yaml) 참고.

## 주요 플로우

1. **UF1 (계약서 업로드)**: `POST /contracts/upload` → `GET /agent-jobs/{jobId}` 폴링 → `POST /contracts/{id}/confirm`
2. **UF2 (줄글 생성)**: `POST /contracts/draft` → `PATCH /contracts/{id}` → `POST /contracts/{id}/generate-pdf` → `POST /contracts/{id}/send`
3. **대타/추가근무**: `POST /extra-shifts` → `POST /extra-shifts/{id}/evidences` → 폴링 → `PATCH /extra-shifts/{id}/mapping` → `POST /extra-shifts/{id}/confirm`
4. **급여**: `GET /employees/{id}/pay-estimate`, `GET /employees/{id}/pay-estimate/stream` (SSE)

## 프로젝트 구조

```
alba-chain/
├── backend/              # FastAPI 백엔드 (자세한 내용은 backend/README.md)
│   ├── app/
│   │   ├── api/v1/       # 라우터 (contracts, extra_shifts, jobs, pay)
│   │   ├── models/       # SQLAlchemy 모델 (org, contract, work_record, extra_shift, agent_job)
│   │   ├── schemas/      # Pydantic 스키마
│   │   ├── services/     # 비즈니스 로직 (추출, 매핑, 급여, Gemini/VLM, PDF)
│   │   └── workers/      # 비동기 잡 러너
│   └── alembic/          # DB 마이그레이션
├── openapi.yaml          # API 명세
├── srs.md                # 제품 요구사항 명세
└── extraction_schema.json# 계약서 추출 필드 스키마
```

## 라이선스

해커톤 MVP 프로젝트.
