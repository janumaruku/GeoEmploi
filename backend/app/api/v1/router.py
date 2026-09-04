from fastapi import APIRouter

from app.api.v1 import auth, map, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(map.router, prefix="/map", tags=["map"])
