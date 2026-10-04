from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.topic_performance import TopicPerformance
from app.models.recommendation_history import RecommendationHistory

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

class TopicPerformanceResponse(BaseModel):
    subject: str
    topic: str
    questions_attempted: int
    correct_answers: int
    accuracy: float

class RecommendationResponse(BaseModel):
    subject: str
    recommended_topic: str
    recommendation_type: str
    reason: str
    created_at: str

class AnalyticsDashboardResponse(BaseModel):
    performance: List[TopicPerformanceResponse]
    recommendations: List[RecommendationResponse]

@router.get("/", response_model=AnalyticsDashboardResponse)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch performance
    perfs = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == current_user.id
    ).all()
    
    perf_list = [
        TopicPerformanceResponse(
            subject=p.subject,
            topic=p.topic,
            questions_attempted=p.questions_attempted,
            correct_answers=p.correct_answers,
            accuracy=p.accuracy
        ) for p in perfs
    ]
    
    # Fetch latest recommendations (top 5)
    recs = db.query(RecommendationHistory).filter(
        RecommendationHistory.user_id == current_user.id
    ).order_by(RecommendationHistory.created_at.desc()).limit(5).all()
    
    rec_list = [
        RecommendationResponse(
            subject=r.subject,
            recommended_topic=r.recommended_topic,
            recommendation_type=r.recommendation_type,
            reason=r.reason,
            created_at=r.created_at.strftime('%Y-%m-%d %H:%M') if r.created_at else "Unknown"
        ) for r in recs
    ]
    
    return AnalyticsDashboardResponse(
        performance=perf_list,
        recommendations=rec_list
    )
