import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    company_name = Column(String, nullable=False)
    siret = Column(String, unique=True, nullable=False)
    sector = Column(String, nullable=True)
    contact_name = Column(String, nullable=True)
    verification_status = Column(Enum(VerificationStatus), nullable=False, default=VerificationStatus.PENDING)

    user = relationship("User", back_populates="employer_profile")
