from __future__ import annotations

from typing import Any

from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class AgentJob(Base):
    """비동기 Agent 잡 상태 (폴링 대상)."""

    __tablename__ = "agent_jobs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # contract_parse | contract_generate | vlm_interpret
    job_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    # queued | running | succeeded | failed
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="queued", index=True
    )
    # 잡이 다루는 대상 리소스 (contract / extra_shift)
    resource_type: Mapped[str | None] = mapped_column(String(32))
    resource_id: Mapped[int | None] = mapped_column(Integer, index=True)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    error: Mapped[str | None] = mapped_column(Text)
