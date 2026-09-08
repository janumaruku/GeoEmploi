from datetime import datetime
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, model_validator

from app.models.offer import OfferStatus


class OfferCreate(BaseModel):
    title: str
    description: str | None = None
    commune: str
    latitude: float
    longitude: float
    diffusion_radius_km: float = 10.0


class OfferUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    commune: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    diffusion_radius_km: float | None = None

    @model_validator(mode="after")
    def validate_commune_location(self):
        values = (self.commune, self.latitude, self.longitude)
        if any(value is not None for value in values) and not all(value is not None for value in values):
            raise ValueError("commune, latitude and longitude must be updated together")
        return self


class OfferRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employer_id: int
    title: str
    description: str | None
    commune: str = Field(validation_alias=AliasChoices("public_commune", "commune"))
    latitude: float
    longitude: float
    diffusion_radius_km: float
    status: OfferStatus
    views_count: int
    created_at: datetime

class OfferStatusUpdate(BaseModel):
    status: OfferStatus
