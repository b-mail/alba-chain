from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import AgentJob as AgentJobModel
from app.schemas import AgentJob

router = APIRouter(prefix="/agent-jobs", tags=["jobs"])


@router.get("/{jobId}", response_model=AgentJob)
def get_job(jobId: int, db: Session = Depends(get_db)) -> AgentJob:
    job = db.get(AgentJobModel, jobId)
    if job is None:
        raise HTTPException(status_code=404, detail="job_not_found")
    return AgentJob.model_validate(job)
