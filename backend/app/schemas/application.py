from datetime import datetime
from pydantic import BaseModel

from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    offer_id: int


class ApplicationRead(BaseModel):
    id: int
    offer_id: int
    applicant_id: int
    status: ApplicationStatus
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
