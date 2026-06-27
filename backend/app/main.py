from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.storage_path  # ensure storage dir exists
    yield


app = FastAPI(
    title="알바 관리 서비스 API (근로계약서 / 대타·추가근무 Agent)",
    version="0.1.0",
    description=(
        "해커톤 MVP용 API. 근로계약서 Agent(PDF 업로드 파싱·줄글 생성), "
        "대타/추가근무 Agent(증빙 VLM 해석·온톨로지 매핑·급여 재계산), 급여 계산."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

app.mount(
    settings.files_url_prefix,
    StaticFiles(directory=str(settings.storage_path)),
    name="files",
)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
