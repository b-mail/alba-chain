# 알바체인 백엔드

AI 온톨로지 기반 알바 매니지먼트 SaaS의 백엔드. `openapi.yaml` 계약을 그대로 구현한다.

- 근로계약서 Agent: PDF 업로드 파싱(UF1), 줄글 입력 생성(UF2)
- 대타/추가근무 Agent: 증빙(카톡 캡처) → Gemini VLM 해석 → 온톨로지 매핑 → 급여 재계산
- 급여 계산: 주휴수당 + 3.3% 세금 반영 실시간 예상 급여 (폴링/SSE)

## 기술 스택

- Python 3.11 + FastAPI + Uvicorn
- PostgreSQL + SQLAlchemy 2.0 + Alembic
- Google Gemini (`google-genai`) — 계약 추출(structured output) + 카톡 캡처 vision 해석
- 비동기 잡: FastAPI BackgroundTasks + `agent_jobs` 상태 테이블 (폴링), SSE 푸시
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

- API 문서: http://localhost:8000/docs
- 베이스 경로: `/api/v1`

## 환경 변수

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL 접속 URL | `postgresql+psycopg://alba:alba@localhost:5432/alba_chain` |
| `GEMINI_API_KEY` | Gemini API 키. 미설정 시 mock 폴백 | (없음) |
| `GEMINI_MODEL` | 사용할 모델 | `gemini-2.0-flash` |
| `STORAGE_DIR` | 파일 저장 루트 | `storage` |

## 주요 플로우

1. UF1: `POST /contracts/upload` → 202(jobId) → `GET /agent-jobs/{jobId}` 폴링 → `POST /contracts/{id}/confirm`
2. UF2: `POST /contracts/draft` → `PATCH /contracts/{id}` → `POST /contracts/{id}/generate-pdf` → `POST /contracts/{id}/send`
3. 대타/추가근무: `POST /extra-shifts` → `POST /extra-shifts/{id}/evidences` → 폴링 → `PATCH /extra-shifts/{id}/mapping` → `POST /extra-shifts/{id}/confirm`
4. 급여: `GET /employees/{id}/pay-estimate`, `GET /employees/{id}/pay-estimate/stream` (SSE)
