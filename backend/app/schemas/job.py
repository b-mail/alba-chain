from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict


class AgentJob(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_type: Literal["contract_parse", "contract_generate", "vlm_interpret"]
    status: Literal["queued", "running", "succeeded", "failed"]
    result: dict[str, Any] | None = None
    error: str | None = None
