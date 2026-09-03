from fastapi import APIRouter

from app.api.v1 import auth, users, offers, applications, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
