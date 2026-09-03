from datetime import datetime
from pydantic import BaseModel

from app.models.offer import OfferStatus


class OfferCreate(BaseModel):
    title: str
    description: str | None = None
    address: str
    latitude: float
    longitude: float
    diffusion_radius_km: float = 10.0


class OfferUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    diffusion_radius_km: float | None = None


class OfferRead(BaseModel):
    id: int
    employer_id: int
    title: str
    description: str | None
    address: str
    latitude: float
    longitude: float
    diffusion_radius_km: float
    status: OfferStatus
    views_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class OfferStatusUpdate(BaseModel):
    status: OfferStatus
