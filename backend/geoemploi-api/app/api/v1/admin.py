from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.core.deps import require_role
from app.models.user import User, UserRole
from app.models.offer import Offer, OfferStatus
from app.models.application import Application

router = APIRouter()


@router.get("/metrics")
def get_national_metrics(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    # endpoint d'agrégation pur, pas de CRUD sur une ressource métier
    # -> légitime de le garder dans un namespace /admin à part.
    return {
        "total_users": db.query(func.count(User.id)).scalar(),
        "total_job_seekers": db.query(func.count(User.id)).filter(User.role == UserRole.JOB_SEEKER).scalar(),
        "total_employers": db.query(func.count(User.id)).filter(User.role == UserRole.EMPLOYER).scalar(),
        "total_offers": db.query(func.count(Offer.id)).scalar(),
        "offers_pending_moderation": db.query(func.count(Offer.id)).filter(Offer.status == OfferStatus.PENDING).scalar(),
        "total_applications": db.query(func.count(Application.id)).scalar(),
    }
