from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class JobSeekerProfile(Base):
    __tablename__ = "job_seeker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    skills = Column(JSON, nullable=False, default=list)
    experiences = Column(JSON, nullable=False, default=list)
    availability = Column(String, nullable=True)

    user = relationship("User", back_populates="job_seeker_profile")
