from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    String
)

from app.database import Base


class TopicPerformance(Base):
    __tablename__ = "topic_performance"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    subject = Column(String(100), nullable=False)

    topic = Column(String(150), nullable=False)

    questions_attempted = Column(
        Integer,
        nullable=False,
        default=0
    )

    correct_answers = Column(
        Integer,
        nullable=False,
        default=0
    )

    accuracy = Column(
        Float,
        nullable=False,
        default=0.0
    )

    last_updated = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )