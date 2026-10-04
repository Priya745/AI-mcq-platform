import time
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.test import Test
from app.core.deps import get_current_user
from app.models.user import User
from app.services.mcq_generator import (
    generate_mcqs, 
    active_tests_cache, 
    cleanup_stale_tests
)

router = APIRouter(
    prefix="/tests",
    tags=["Tests"]
)

class GenerateTestRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str
    question_count: int
    time_limit_minutes: int

class GeneratedQuestionResponse(BaseModel):
    question: str
    options: List[str]
    blooms_level: str

class GenerateTestResponse(BaseModel):
    test_id: int
    questions: List[GeneratedQuestionResponse]

@router.post("/generate", response_model=GenerateTestResponse)
async def create_test(
    request: GenerateTestRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Cleanup old tests occasionally
    cleanup_stale_tests()

    # Generate questions
    full_questions = await generate_mcqs(
        subject=request.subject,
        topic=request.topic,
        difficulty=request.difficulty,
        count=request.question_count
    )
    
    # Save test metadata to database
    db_test = Test(
        user_id=current_user.id,
        subject=request.subject,
        topics=request.topic,
        difficulty=request.difficulty,
        question_count=request.question_count,
        time_limit_minutes=request.time_limit_minutes,
        status="in_progress"
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    
    # Store full questions temporarily in server memory
    active_tests_cache[db_test.id] = {
        "user_id": current_user.id,
        "questions": full_questions,
        "created_at": time.time()
    }
    
    # Strip correct_answer and explanation for frontend
    safe_questions = [
        GeneratedQuestionResponse(
            question=q["question"],
            options=q["options"],
            blooms_level=q.get("blooms_level", "Unknown")
        ) for q in full_questions
    ]
    
    return GenerateTestResponse(
        test_id=db_test.id,
        questions=safe_questions
    )

class SubmitTestRequest(BaseModel):
    questions: List[Dict[str, Any]]
    user_answers: Dict[str, str]

class EvaluatedQuestion(BaseModel):
    question: str
    user_answer: str | None
    correct_answer: str
    is_correct: bool
    explanation: str
    blooms_level: str

class SubmitTestResponse(BaseModel):
    test_id: int
    score: int
    total_questions: int
    percentage: float
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    evaluations: List[EvaluatedQuestion]

from app.models.topic_performance import TopicPerformance
from app.models.recommendation_history import RecommendationHistory

@router.post("/{test_id}/submit", response_model=SubmitTestResponse)
def submit_test(
    test_id: int,
    request: SubmitTestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve the active test from cache
    cached_test = active_tests_cache.get(test_id)
    
    if not cached_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Test session expired or not found."
        )
        
    if cached_test["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to submit this test."
        )
        
    # Get the db row
    db_test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not db_test or db_test.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Test already submitted or invalid.")
        
    correct_count = 0
    incorrect_count = 0
    unanswered_count = 0
    evaluations = []
    
    # Evaluate answers using the cached answer key
    for idx, q_data in enumerate(cached_test["questions"]):
        user_ans = request.user_answers.get(str(idx))
        correct_ans = q_data["correct_answer"]
        
        is_correct = False
        if not user_ans:
            unanswered_count += 1
        elif user_ans.strip() == correct_ans.strip():
            correct_count += 1
            is_correct = True
        else:
            incorrect_count += 1
            
        evaluations.append(
            EvaluatedQuestion(
                question=q_data["question"],
                user_answer=user_ans,
                correct_answer=correct_ans,
                is_correct=is_correct,
                explanation=q_data["explanation"],
                blooms_level=q_data.get("blooms_level", "Unknown")
            )
        )
        
    total = len(cached_test["questions"])
    score = correct_count
    percentage = (score / total) * 100 if total > 0 else 0
    
    # Update DB Test Row
    db_test.status = "completed"
    db_test.score = score
    db_test.correct_count = correct_count
    db_test.incorrect_count = incorrect_count
    db_test.unanswered_count = unanswered_count
    db_test.completed_at = time.strftime('%Y-%m-%d %H:%M:%S')
    
    # Update Topic Performance
    topic_perf = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == current_user.id,
        TopicPerformance.subject == db_test.subject,
        TopicPerformance.topic == db_test.topics
    ).first()
    
    if not topic_perf:
        topic_perf = TopicPerformance(
            user_id=current_user.id,
            subject=db_test.subject,
            topic=db_test.topics,
            questions_attempted=0,
            correct_answers=0,
            accuracy=0.0
        )
        db.add(topic_perf)
        
    topic_perf.questions_attempted += total
    topic_perf.correct_answers += correct_count
    topic_perf.accuracy = (topic_perf.correct_answers / topic_perf.questions_attempted) * 100
    
    # Simple Recommendation Logic
    if percentage < 50:
        rec_type = "Review Required"
        reason = f"Scored {percentage:.1f}% on {db_test.topics}. Please review the foundational concepts."
    elif percentage < 80:
        rec_type = "Practice More"
        reason = f"Scored {percentage:.1f}%. Good, but you can improve your mastery of {db_test.topics}."
    else:
        rec_type = "Advance"
        reason = f"Excellent score of {percentage:.1f}%! Try harder difficulty questions next."
        
    rec = RecommendationHistory(
        user_id=current_user.id,
        subject=db_test.subject,
        recommended_topic=db_test.topics,
        recommendation_type=rec_type,
        reason=reason
    )
    db.add(rec)
    
    db.commit()
    
    # Clear the temporary cache
    del active_tests_cache[test_id]
    
    return SubmitTestResponse(
        test_id=test_id,
        score=score,
        total_questions=total,
        percentage=percentage,
        correct_count=correct_count,
        incorrect_count=incorrect_count,
        unanswered_count=unanswered_count,
        evaluations=evaluations
    )

class TestHistoryItem(BaseModel):
    id: int
    subject: str
    topics: str
    difficulty: str
    score: int
    question_count: int
    percentage: float
    completed_at: str

@router.get("/history", response_model=List[TestHistoryItem])
def get_test_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tests = db.query(Test).filter(
        Test.user_id == current_user.id,
        Test.status == "completed"
    ).order_by(Test.completed_at.desc()).all()
    
    history = []
    for t in tests:
        # Prevent division by zero
        pct = (t.score / t.question_count) * 100 if t.question_count > 0 else 0
        history.append(
            TestHistoryItem(
                id=t.id,
                subject=t.subject,
                topics=t.topics,
                difficulty=t.difficulty,
                score=t.score,
                question_count=t.question_count,
                percentage=pct,
                completed_at=t.completed_at.strftime('%Y-%m-%d %H:%M') if t.completed_at else "Unknown"
            )
        )
    return history

