from fastapi import APIRouter

from app.routers.v1.auth import router as auth_router
from app.routers.v1.test import router as test_router
from app.routers.v1.analytics import router as analytics_router
from app.routers.v1.pdf import router as pdf_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(test_router)
router.include_router(analytics_router)
router.include_router(pdf_router)