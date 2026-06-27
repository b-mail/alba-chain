from app.schemas.common import Error, JobAccepted
from app.schemas.contract import (
    Contract,
    ContractDocument,
    ContractDraftRequest,
    ContractSendRequest,
    ContractTermsInput,
    WorkScheduleInput,
)
from app.schemas.extra_shift import (
    ExtraShift,
    ExtraShiftConfirmResponse,
    ExtraShiftCreate,
    ExtraShiftMappingRequest,
    ExtraShiftRejectRequest,
    MappingCandidate,
    VlmExtraction,
)
from app.schemas.job import AgentJob
from app.schemas.pay import PayEstimate

__all__ = [
    "Error",
    "JobAccepted",
    "Contract",
    "ContractDocument",
    "ContractDraftRequest",
    "ContractSendRequest",
    "ContractTermsInput",
    "WorkScheduleInput",
    "ExtraShift",
    "ExtraShiftConfirmResponse",
    "ExtraShiftCreate",
    "ExtraShiftMappingRequest",
    "ExtraShiftRejectRequest",
    "MappingCandidate",
    "VlmExtraction",
    "AgentJob",
    "PayEstimate",
]
