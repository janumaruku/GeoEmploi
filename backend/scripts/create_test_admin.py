import argparse

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole, UserStatus


ADMIN_EMAIL = "admin@geoemploi.test"
ADMIN_PASSWORD = "Admin1234!"


def create_test_admin() -> None:
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing_user:
            print(f"Le compte {ADMIN_EMAIL} existe déjà. Aucun changement effectué.")
            return

        admin = User(
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
        )
        db.add(admin)
        db.commit()
        print(f"Compte administrateur créé : {ADMIN_EMAIL}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def delete_test_admin() -> None:
    db = SessionLocal()
    try:
        admin = db.query(User).filter(
            User.email == ADMIN_EMAIL,
            User.role == UserRole.ADMIN,
        ).first()
        if not admin:
            print(f"Aucun compte administrateur {ADMIN_EMAIL} à supprimer.")
            return

        db.delete(admin)
        db.commit()
        print(f"Compte administrateur supprimé : {ADMIN_EMAIL}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gère uniquement le compte administrateur de test.")
    parser.add_argument("--delete", action="store_true", help="Supprime le compte administrateur de test.")
    args = parser.parse_args()

    if args.delete:
        delete_test_admin()
    else:
        create_test_admin()
