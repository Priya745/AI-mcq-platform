from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text
)

from app.database import Base


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    subject = Column(String(100), nullable=False)

    recommended_topic = Column(
        String(150),
        nullable=False
    )

    recommendation_type = Column(
        String(50),
        nullable=False
    )

    reason = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )