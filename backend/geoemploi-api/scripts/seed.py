"""Peuple la base avec des données réalistes pour le test de charge exigé
par le cabinet : au moins 500 offres réparties sur au moins 50 communes.

Usage :
    python -m scripts.seed
    python -m scripts.seed --offers 500 --employers 60

Idempotent-friendly : n'échoue pas si relancé, mais crée de nouvelles
lignes à chaque exécution (pas de dédoublonnage) — pensé pour tourner sur
une base de test qu'on recrée avant chaque campagne de charge, pas sur une
base de prod.
"""
import argparse
import random

from faker import Faker
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.employer_profile import EmployerProfile, VerificationStatus
from app.models.offer import Offer, OfferStatus
from app.core.security import hash_password
from scripts.communes import COMMUNES

fake = Faker("fr_FR")

JOB_TITLES = [
    "Développeur Python", "Développeur React", "Chef de projet digital",
    "Data analyst", "Ingénieur DevOps", "Chargé de recrutement",
    "Comptable", "Assistant administratif", "Technicien de maintenance",
    "Vendeur en magasin", "Cuisinier", "Serveur", "Infirmier",
    "Aide-soignant", "Conducteur de travaux", "Électricien",
    "Plombier", "Agent d'entretien", "Livreur", "Magasinier",
]


def seed(db: Session, n_offers: int, n_employers: int) -> None:
    employers: list[User] = []
    for i in range(n_employers):
        user = User(
            email=f"employer{i}@seed.test",
            hashed_password=hash_password("seedpassword"),
            role=UserRole.EMPLOYER,
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        db.flush()
        db.add(EmployerProfile(
            user_id=user.id,
            company_name=fake.company(),
            siret=fake.numerify("##############"),
            sector=random.choice(["Tech", "BTP", "Santé", "Commerce", "Restauration"]),
            verification_status=VerificationStatus.VERIFIED,
        ))
        employers.append(user)
    db.commit()
    print(f"{n_employers} employeurs créés.")

    for _ in range(n_offers):
        commune, lat, lng = random.choice(COMMUNES)
        # légère dispersion autour du centre-ville pour éviter que toutes
        # les offres d'une même commune se superposent exactement
        jitter = lambda v: v + random.uniform(-0.03, 0.03)
        offer = Offer(
            employer_id=random.choice(employers).id,
            title=random.choice(JOB_TITLES),
            description=fake.paragraph(nb_sentences=3),
            address=f"{fake.street_address()}, {commune}",
            latitude=jitter(lat),
            longitude=jitter(lng),
            diffusion_radius_km=random.choice([5, 10, 20, 30]),
            status=OfferStatus.APPROVED,
        )
        db.add(offer)
    db.commit()
    print(f"{n_offers} offres créées sur {len(COMMUNES)} communes.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offers", type=int, default=500)
    parser.add_argument("--employers", type=int, default=60)
    args = parser.parse_args()

    db = SessionLocal()
    try:
        seed(db, n_offers=args.offers, n_employers=args.employers)
    finally:
        db.close()


if __name__ == "__main__":
    main()
