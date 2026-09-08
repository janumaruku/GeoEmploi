import os
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.offer import Offer, OfferStatus
from app.core.security import hash_password
from scripts.commune_centroids import get_commune_centroid

COMMUNES = [
    "Paris",
    "Lyon",
    "Bordeaux",
]

def seed_demo(db: Session) -> None:
    # 1. Admin Demo
    admin = db.query(User).filter(User.email == "admin@geoemploi.demo").first()
    if not admin:
        admin = User(
            email="admin@geoemploi.demo",
            hashed_password=hash_password("Demo1234!"),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
        )
        db.add(admin)

    # 2. Employer Demo
    employer = db.query(User).filter(User.email == "employer@geoemploi.demo").first()
    if not employer:
        employer = User(
            email="employer@geoemploi.demo",
            hashed_password=hash_password("Demo1234!"),
            role=UserRole.EMPLOYER,
            status=UserStatus.ACTIVE,
        )
        db.add(employer)
    
    # 3. Job Seeker Demo
    seeker = db.query(User).filter(User.email == "jobseeker@geoemploi.demo").first()
    if not seeker:
        seeker = User(
            email="jobseeker@geoemploi.demo",
            hashed_password=hash_password("Demo1234!"),
            role=UserRole.JOB_SEEKER,
            status=UserStatus.ACTIVE,
        )
        db.add(seeker)
    
    db.commit()

    # Create demo offers
    if db.query(Offer).count() < 10:
        demo_titles = ["Développeur Python", "Chef de projet digital", "Data Analyst"]
        for i, title in enumerate(demo_titles):
            commune_query = COMMUNES[i % len(COMMUNES)]
            commune, lat, lng = get_commune_centroid(commune_query)
            db.add(Offer(
                employer_id=employer.id,
                title=title,
                description=f"Offre de démonstration — {title}",
                commune=commune,
                address=commune,
                latitude=lat,
                longitude=lng,
                diffusion_radius_km=10.0,
                status=OfferStatus.APPROVED,
            ))
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_demo(db)
        print("Demo seeding complete!")
    finally:
        db.close()
