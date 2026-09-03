import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class OfferStatus(str, enum.Enum):
    PENDING = "pending"      # en attente de modération admin
    APPROVED = "approved"
    REJECTED = "rejected"


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    diffusion_radius_km = Column(Float, nullable=False, default=10.0)

    status = Column(Enum(OfferStatus), nullable=False, default=OfferStatus.PENDING)
    views_count = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    employer = relationship("User")
    applications = relationship("Application", back_populates="offer", cascade="all, delete-orphan")
