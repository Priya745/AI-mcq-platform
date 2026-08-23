from fastapi import FastAPI

from app.database import Base, engine
from app.models import (
    User,
    Test,
    TopicPerformance,
    RecommendationHistory,
)

# from app.routers.v1.health import router as health_router
from app.routers.v1.router import router as v1_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI-Powered Personalized MCQ Generator",
    description="Backend API for the MCQ Test Generator",
    version="1.0.0",
)

# app.include_router(
#     health_router,
#     prefix="/api/v1"
# )
app.include_router(v1_router)


@app.get("/")
def root():
    return {
        "message": "MCQ Generator API is running!"
    }


