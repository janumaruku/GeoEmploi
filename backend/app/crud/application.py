from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate


def create_application(db: Session, applicant_id: int, data: ApplicationCreate) -> Application:
    application = Application(
        offer_id=data.offer_id,
        applicant_id=applicant_id,
        status=ApplicationStatus.PENDING,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_application(db: Session, application_id: int) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).first()


def list_applications(
    db: Session,
    offer_id: int | None = None,
    applicant_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Application]:
    query = db.query(Application)
    if offer_id is not None:
        query = query.filter(Application.offer_id == offer_id)
    if applicant_id is not None:
        query = query.filter(Application.applicant_id == applicant_id)
    return query.offset(skip).limit(limit).all()


def update_application_status(db: Session, application: Application, status: ApplicationStatus) -> Application:
    application.status = status
    db.commit()
    db.refresh(application)
    return application


def has_already_applied(db: Session, offer_id: int, applicant_id: int) -> bool:
    return (
        db.query(Application)
        .filter(Application.offer_id == offer_id, Application.applicant_id == applicant_id)
        .first()
        is not None
    )
