import os
import json
import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# In-memory storage for active tests
# Structure: { test_id: { "user_id": int, "questions": List[dict], "created_at": float } }
active_tests_cache: Dict[int, Dict[str, Any]] = {}

def cleanup_stale_tests(max_age_minutes: int = 120):
    """Removes tests from memory that are older than max_age_minutes."""
    current_time = time.time()
    stale_ids = [
        t_id for t_id, data in active_tests_cache.items()
        if current_time - data["created_at"] > (max_age_minutes * 60)
    ]
    for t_id in stale_ids:
        del active_tests_cache[t_id]

class MCQOption(BaseModel):
    text: str

class MCQ(BaseModel):
    question: str = Field(description="The multiple choice question text")
    options: List[str] = Field(description="Exactly 4 options for the question")
    correct_answer: str = Field(description="The exact text of the correct option")
    explanation: str = Field(description="Explanation of why the answer is correct")
    blooms_level: str = Field(description="Bloom's Taxonomy level (Remember, Understand, Apply, Analyze)")

class MCQList(BaseModel):
    questions: List[MCQ]

async def generate_mcqs(subject: str, topic: str, difficulty: str, count: int) -> List[dict]:
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        # Mock response for development without API key
        return [
            {
                "question": f"Sample {difficulty} question about {topic} in {subject} ({i+1})?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "This is a mock explanation because GEMINI_API_KEY is not set.",
                "blooms_level": "Understand"
            } for i in range(count)
        ]
        
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        
        # Reverted to gemini-3.6-flash as requested
        model = genai.GenerativeModel('gemini-3.6-flash')
        
        prompt = f"""
        You are an expert educator. Generate exactly {count} {difficulty} questions about '{topic}' in the subject of '{subject}'.
        Each question must have exactly 4 options. Include the correct answer, a detailed explanation, and classify the question according to Bloom's Taxonomy (Remember, Understand, Apply, or Analyze).
        
        You MUST respond ONLY with a valid JSON array of objects, containing no other text or markdown formatting. 
        Example structure:
        [
            {{
                "question": "What is ...?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "A",
                "explanation": "Because ...",
                "blooms_level": "Understand"
            }}
        ]
        """
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        text = response.text
        
        # Clean up any potential markdown code blocks returned by Gemini
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        questions = json.loads(text.strip())
        
        # Ensure it matches the expected structure
        if not isinstance(questions, list):
            raise ValueError("LLM did not return a list")
            
        return questions
    except Exception as e:
        error_msg = str(e)
        print(f"LLM Generation Error: {error_msg}")
        
        # If it's a quota issue, raise a clear error so the frontend can display it
        if "429" in error_msg or "quota" in error_msg.lower():
            from fastapi import HTTPException
            raise HTTPException(status_code=429, detail="Gemini AI Free Tier quota exceeded. Please try again later.")
            
        # Fallback to mock on other errors
        return [
            {
                "question": f"Fallback {difficulty} question about {topic} ({i+1})? (Error: {error_msg})",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "Fallback explanation due to generation error.",
                "blooms_level": "Understand"
            } for i in range(count)
        ]

