from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationStatusUpdate
from app.crud import application as crud_application
from app.crud import offer as crud_offer

router = APIRouter()


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only job seekers can apply")
    offer = crud_offer.get_offer(db, data.offer_id)
    if not offer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offer not found")
    if crud_application.has_already_applied(db, data.offer_id, current_user.id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Already applied to this offer")
    return crud_application.create_application(db, current_user.id, data)


@router.get("", response_model=list[ApplicationRead])
def list_applications(
    offer_id: int | None = None,
    applicant_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # un job_seeker ne voit que ses propres candidatures ;
    # un employer ne voit que les candidatures sur ses propres offres ;
    # un admin voit tout.
    if current_user.role == UserRole.JOB_SEEKER:
        applicant_id = current_user.id
    elif current_user.role == UserRole.EMPLOYER:
        if offer_id is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "offer_id required for employers")
        offer = crud_offer.get_offer(db, offer_id)
        if not offer or offer.employer_id != current_user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
    return crud_application.list_applications(db, offer_id=offer_id, applicant_id=applicant_id)


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = crud_application.get_application(db, application_id)
    if not application:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    offer = crud_offer.get_offer(db, application.offer_id)
    is_owner_offer = current_user.id == offer.employer_id if offer else False
    is_applicant = current_user.id == application.applicant_id
    if not (is_applicant or is_owner_offer or current_user.role == UserRole.ADMIN):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return application


@router.patch("/{application_id}/status", response_model=ApplicationRead)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = crud_application.get_application(db, application_id)
    if not application:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    offer = crud_offer.get_offer(db, application.offer_id)
    is_owner_offer = current_user.id == offer.employer_id if offer else False
    if not (is_owner_offer or current_user.role == UserRole.ADMIN):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return crud_application.update_application_status(db, application, data.status)
