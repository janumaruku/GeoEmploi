"""Prépare la reprise des anciennes offres vers une localisation communale.

La commande fonctionne en simulation par défaut. Ajouter --apply pour enregistrer
les communes et remplacer les anciennes coordonnées par les centroïdes officiels.
"""

import argparse

from app.db.session import SessionLocal
from app.models.offer import Offer
from scripts.commune_centroids import get_commune_centroid


def extract_commune(address: str) -> str:
    value = address.rsplit(",", 1)[-1].strip()
    parts = value.split(maxsplit=1)
    if len(parts) == 2 and parts[0].isdigit() and len(parts[0]) == 5:
        return parts[1]
    return value


def run(apply_changes: bool) -> None:
    db = SessionLocal()
    cache: dict[str, tuple[str, float, float]] = {}
    converted = 0
    errors: list[tuple[int, str]] = []

    try:
        offers = db.query(Offer).filter(Offer.commune.is_(None)).order_by(Offer.id).all()
        for offer in offers:
            candidate = extract_commune(offer.address)
            try:
                if candidate not in cache:
                    cache[candidate] = get_commune_centroid(candidate)
                result = cache[candidate]
            except Exception as error:
                errors.append((offer.id, str(error)))
                continue

            commune, latitude, longitude = result
            print(f"offre {offer.id}: {offer.address!r} -> {commune} ({latitude}, {longitude})")
            converted += 1
            if apply_changes:
                offer.commune = commune
                offer.address = commune
                offer.latitude = latitude
                offer.longitude = longitude

        if apply_changes and not errors:
            db.commit()
        else:
            db.rollback()

        mode = "appliquée" if apply_changes and not errors else "simulation"
        print(f"Reprise {mode}: {converted} offre(s) convertible(s), {len(errors)} erreur(s).")
        if errors:
            print("Aucune modification enregistrée.")
            for offer_id, message in errors:
                print(f"offre {offer_id}: {message}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="enregistre la reprise si toutes les offres sont convertibles")
    args = parser.parse_args()
    run(args.apply)


if __name__ == "__main__":
    main()
