from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.user import User, UserRole, UserStatus
from app.models.job_seeker_profile import JobSeekerProfile
from app.models.employer_profile import EmployerProfile
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password


def create_user(db: Session, data: UserCreate) -> User:
    if data.role == UserRole.JOB_SEEKER and not data.job_seeker_profile:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "job_seeker_profile required")
    if data.role == UserRole.EMPLOYER and not data.employer_profile:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "employer_profile required")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        # un employeur démarre non-actif tant qu'il n'est pas vérifié (cf. sujet)
        status=UserStatus.PENDING_VERIFICATION if data.role == UserRole.EMPLOYER else UserStatus.ACTIVE,
    )
    db.add(user)
    db.flush()  # récupère user.id sans commit, pour lier le profil

    if data.role == UserRole.JOB_SEEKER:
        db.add(JobSeekerProfile(
            user_id=user.id,
            first_name=data.job_seeker_profile.first_name,
            last_name=data.job_seeker_profile.last_name,
        ))
    elif data.role == UserRole.EMPLOYER:
        db.add(EmployerProfile(
            user_id=user.id,
            company_name=data.employer_profile.company_name,
            siret=data.employer_profile.siret,
            sector=data.employer_profile.sector,
            contact_name=data.employer_profile.contact_name,
        ))

    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int) -> User | None:
    return (
        db.query(User)
        .options(joinedload(User.job_seeker_profile), joinedload(User.employer_profile))
        .filter(User.id == user_id)
        .first()
    )


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def list_users(db: Session, skip: int = 0, limit: int = 50) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    if data.email is not None:
        user.email = data.email
    if data.password is not None:
        user.hashed_password = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user


def update_user_status(db: Session, user: User, status: UserStatus) -> User:
    user.status = status
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
