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


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    subject = Column(String(100), nullable=False)

    topics = Column(Text, nullable=False)

    difficulty = Column(String(20), nullable=False)

    question_count = Column(Integer, nullable=False)

    time_limit_minutes = Column(Integer, nullable=False)

    score = Column(Integer, nullable=True)

    status = Column(
        String(20),
        nullable=False,
        default="in_progress"
    )

    started_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )