from sqlalchemy.orm import Session

from app.models.offer import Offer, OfferStatus
from app.schemas.offer import OfferCreate, OfferUpdate


def create_offer(db: Session, employer_id: int, data: OfferCreate) -> Offer:
    offer = Offer(
        employer_id=employer_id,
        title=data.title,
        description=data.description,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        diffusion_radius_km=data.diffusion_radius_km,
        status=OfferStatus.PENDING,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


def get_offer(db: Session, offer_id: int) -> Offer | None:
    return db.query(Offer).filter(Offer.id == offer_id).first()


def list_offers(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    status: OfferStatus | None = None,
    employer_id: int | None = None,
) -> list[Offer]:
    query = db.query(Offer)
    if status is not None:
        query = query.filter(Offer.status == status)
    if employer_id is not None:
        query = query.filter(Offer.employer_id == employer_id)
    return query.offset(skip).limit(limit).all()


def update_offer(db: Session, offer: Offer, data: OfferUpdate) -> Offer:
    for field in ("title", "description", "address", "latitude", "longitude", "diffusion_radius_km"):
        value = getattr(data, field)
        if value is not None:
            setattr(offer, field, value)
    db.commit()
    db.refresh(offer)
    return offer


def update_offer_status(db: Session, offer: Offer, status: OfferStatus) -> Offer:
    offer.status = status
    db.commit()
    db.refresh(offer)
    return offer


def increment_views(db: Session, offer: Offer) -> Offer:
    offer.views_count += 1
    db.commit()
    db.refresh(offer)
    return offer


def delete_offer(db: Session, offer: Offer) -> None:
    db.delete(offer)
    db.commit()
