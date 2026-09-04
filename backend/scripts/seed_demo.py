"""Crée les comptes de démonstration (un par rôle utilisateur).

Script isolé, utilisé UNIQUEMENT par le workflow CI pour peupler la base
avec des identifiants connus que l'évaluateur peut utiliser immédiatement.

Usage :
    python -m scripts.seed_demo
"""
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.employer_profile import EmployerProfile, VerificationStatus
from app.models.job_seeker_profile import JobSeekerProfile
from app.models.admin_profile import AdminProfile
from app.models.offer import Offer, OfferStatus
from app.core.security import hash_password
from scripts.communes import COMMUNES

DEMO_PASSWORD = "Demo1234!"

DEMO_ACCOUNTS = [
    {
        "email": "admin@geoemploi.demo",
        "role": UserRole.ADMIN,
        "profile_factory": lambda uid: AdminProfile(
            user_id=uid, department="Direction",
        ),
    },
    {
        "email": "employer@geoemploi.demo",
        "role": UserRole.EMPLOYER,
        "profile_factory": lambda uid: EmployerProfile(
            user_id=uid,
            company_name="Démo Entreprise",
            siret="00000000000001",
            sector="Tech",
            contact_name="Jean Démo",
            verification_status=VerificationStatus.VERIFIED,
        ),
    },
    {
        "email": "jobseeker@geoemploi.demo",
        "role": UserRole.JOB_SEEKER,
        "profile_factory": lambda uid: JobSeekerProfile(
            user_id=uid,
            first_name="Marie",
            last_name="Démo",
            skills=["Python", "React", "SQL"],
            experiences=[{"title": "Développeuse web", "company": "Acme", "years": 2}],
            availability="immédiate",
        ),
    },
]


def seed_demo(db: Session) -> None:
    """Create one demo account per user type (idempotent)."""
    hashed = hash_password(DEMO_PASSWORD)
    for acct in DEMO_ACCOUNTS:
        if db.query(User).filter_by(email=acct["email"]).first():
            print(f"    {acct['email']} existe déjà, on passe.")
            continue
        user = User(
            email=acct["email"],
            hashed_password=hashed,
            role=acct["role"],
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        db.flush()
        db.add(acct["profile_factory"](user.id))
        print(f"    {acct['email']} créé (rôle {acct['role'].value})")
    db.commit()

    # ── Create a few demo offers for the employer account ──────────
    employer = db.query(User).filter_by(email="employer@geoemploi.demo").first()
    if employer and db.query(Offer).filter_by(employer_id=employer.id).count() == 0:
        import random
        demo_titles = [
            "Développeur Python", "Chef de projet digital", "Data Analyst",
        ]
        for i, title in enumerate(demo_titles):
            commune, lat, lng = COMMUNES[i % len(COMMUNES)]
            db.add(Offer(
                employer_id=employer.id,
                title=title,
                description=f"Offre de démonstration — {title}",
                address=f"1 Rue Principale, {commune}",
                latitude=lat,
                longitude=lng,
                diffusion_radius_km=10.0,
                status=OfferStatus.APPROVED,
            ))
        db.commit()
        print(f"  ✔  {len(demo_titles)} offres de démonstration créées.")


def main():
    print("Création des comptes de démonstration …")
    db = SessionLocal()
    try:
        seed_demo(db)
    finally:
        db.close()
    print("Terminé.")


if __name__ == "__main__":
    main()
