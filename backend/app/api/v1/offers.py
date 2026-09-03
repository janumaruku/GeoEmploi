from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.offer import OfferStatus
from app.schemas.offer import OfferCreate, OfferRead, OfferUpdate, OfferStatusUpdate
from app.crud import offer as crud_offer

router = APIRouter()


@router.post("", response_model=OfferRead, status_code=status.HTTP_201_CREATED)
def create_offer(
    data: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.EMPLOYER)),
):
    return crud_offer.create_offer(db, current_user.id, data)


@router.get("", response_model=list[OfferRead])
def list_offers(
    status_filter: OfferStatus | None = None,
    employer_id: int | None = None,
    db: Session = Depends(get_db),
):
    return crud_offer.list_offers(db, status=status_filter, employer_id=employer_id)


@router.get("/{offer_id}", response_model=OfferRead)
def get_offer(offer_id: int, db: Session = Depends(get_db)):
    offer = crud_offer.get_offer(db, offer_id)
    if not offer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offer not found")
    crud_offer.increment_views(db, offer)
    return offer


@router.put("/{offer_id}", response_model=OfferRead)
def update_offer(
    offer_id: int,
    data: OfferUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer = crud_offer.get_offer(db, offer_id)
    if not offer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offer not found")
    if current_user.id != offer.employer_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return crud_offer.update_offer(db, offer, data)


@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer = crud_offer.get_offer(db, offer_id)
    if not offer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offer not found")
    if current_user.id != offer.employer_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    crud_offer.delete_offer(db, offer)


@router.patch("/{offer_id}/status", response_model=OfferRead)
def update_offer_status(
    offer_id: int,
    data: OfferStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    offer = crud_offer.get_offer(db, offer_id)
    if not offer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Offer not found")
    return crud_offer.update_offer_status(db, offer, data.status)
