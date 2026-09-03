from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import get_db

app = FastAPI(title="GéoEmploi API", version=settings.app_version)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Ne doit dépendre QUE de la DB, jamais du fournisseur de tuiles ni d'un
    # service externe — sinon le health check tombe en même temps que ce
    # qu'il est censé surveiller (exigence explicite du cabinet).
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db_status = "unreachable"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "version": settings.app_version,
        "database": db_status,
    }
