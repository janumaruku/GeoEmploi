from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str = "change-me-in-production"
    app_version: str = "0.1.0"

    class Config:
        env_file = ".env"


settings = Settings()
