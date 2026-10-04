import asyncio
import json
from app.services.mcq_generator import generate_mcqs

async def test_generation():
    print("Testing MCQ generation...")
    try:
        # Generate 3 Medium Python questions
        results = await generate_mcqs(
            subject="Computer Science",
            topic="Python",
            difficulty="Medium",
            count=3
        )
        print("Generated Successfully!")
        print(json.dumps(results, indent=2))
        
        # Verify structure
        for i, q in enumerate(results):
            assert "question" in q
            assert "options" in q and len(q["options"]) == 4
            assert "correct_answer" in q
            assert "explanation" in q
            assert "blooms_level" in q
            print(f"Question {i+1} structure verified.")
            
    except Exception as e:
        print(f"Test failed with error: {e}")

if __name__ == "__main__":
    asyncio.run(test_generation())
