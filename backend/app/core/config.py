from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str = "change-me-in-production"
    app_version: str = "0.1.0"

    # JWT
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Cartographie : le navigateur passe exclusivement par le proxy GéoEmploi.
    ign_wmts_base_url: str = "https://data.geopf.fr/wmts"
    ign_wmts_layer: str = "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2"
    ign_wmts_timeout_seconds: float = 8.0
    map_cache_dir: str = "/tmp/geoemploi-map-cache"

    class Config:
        env_file = ".env"


settings = Settings()
