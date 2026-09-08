import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen


COMMUNES_API_URL = "https://geo.api.gouv.fr/communes"


def get_commune_centroid(name: str) -> tuple[str, float, float]:
    query = urlencode({
        "nom": name,
        "fields": "nom,centre",
        "boost": "population",
        "limit": 1,
    })
    request = Request(f"{COMMUNES_API_URL}?{query}", headers={"User-Agent": "GeoEmploi/0.1"})
    with urlopen(request, timeout=10) as response:
        results = json.load(response)

    if not results or not results[0].get("centre", {}).get("coordinates"):
        raise ValueError(f"Commune introuvable : {name}")

    commune = results[0]
    longitude, latitude = commune["centre"]["coordinates"]
    return commune["nom"], latitude, longitude
