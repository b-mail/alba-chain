from pydantic import BaseModel


class Error(BaseModel):
    code: str
    message: str


class JobAccepted(BaseModel):
    job_id: int
    status: str = "queued"
    poll_url: str
