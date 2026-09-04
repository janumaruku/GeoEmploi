from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, Response, status

from app.core.config import settings

router = APIRouter()

def _tile_path(z: int, x: int, y: int) -> Path:
    return Path(settings.map_cache_dir) / settings.ign_wmts_layer / str(z) / str(x) / f"{y}.png"


@router.get("/tiles/{z}/{x}/{y}")
def get_tile(z: int, x: int, y: int) -> Response:
    max_index = (2 ** z) - 1
    if not 0 <= z <= 21 or not 0 <= x <= max_index or not 0 <= y <= max_index:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid tile coordinates")

    cache_path = _tile_path(z, x, y)
    if cache_path.is_file():
        return Response(cache_path.read_bytes(), media_type="image/png", headers={"X-Map-Cache": "HIT"})

    query = urlencode({
        "SERVICE": "WMTS",
        "VERSION": "1.0.0",
        "REQUEST": "GetTile",
        "LAYER": settings.ign_wmts_layer,
        "STYLE": "normal",
        "FORMAT": "image/png",
        "TILEMATRIXSET": "PM",
        "TILEMATRIX": z,
        "TILEROW": y,
        "TILECOL": x,
    })
    request = Request(f"{settings.ign_wmts_base_url}?{query}", headers={"User-Agent": "GeoEmploi/0.1"})

    try:
        with urlopen(request, timeout=settings.ign_wmts_timeout_seconds) as upstream:
            tile = upstream.read()
            content_type = upstream.headers.get_content_type()
    except (HTTPError, URLError, TimeoutError) as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "Le fond cartographique est temporairement indisponible",
        ) from exc

    if not content_type.startswith("image/"):
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Invalid response from map provider")

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = cache_path.with_suffix(".tmp")
    temporary_path.write_bytes(tile)
    temporary_path.replace(cache_path)
    return Response(tile, media_type=content_type, headers={"X-Map-Cache": "MISS"})
