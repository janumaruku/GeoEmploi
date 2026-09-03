from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.models.user import UserRole, UserStatus


class JobSeekerProfileCreate(BaseModel):
    first_name: str
    last_name: str


class EmployerProfileCreate(BaseModel):
    company_name: str
    siret: str
    sector: str | None = None
    contact_name: str | None = None


class JobSeekerProfileRead(BaseModel):
    first_name: str
    last_name: str
    skills: list
    experiences: list
    availability: str | None

    class Config:
        from_attributes = True


class EmployerProfileRead(BaseModel):
    company_name: str
    siret: str
    sector: str | None
    contact_name: str | None
    verification_status: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    job_seeker_profile: JobSeekerProfileCreate | None = None
    employer_profile: EmployerProfileCreate | None = None


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    status: UserStatus
    created_at: datetime
    job_seeker_profile: JobSeekerProfileRead | None = None
    employer_profile: EmployerProfileRead | None = None

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    status: UserStatus
