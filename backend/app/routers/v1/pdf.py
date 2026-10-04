from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from app.core.deps import get_current_user
from app.models.user import User
from app.routers.v1.test import SubmitTestResponse
import io

router = APIRouter(
    prefix="/pdf",
    tags=["PDF"]
)

@router.post("/generate")
def generate_pdf(
    result: SubmitTestResponse,
    current_user: User = Depends(get_current_user)
):
    # Construct an HTML report from the result payload
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; color: #333; }}
            h1 {{ color: #2563eb; }}
            h2 {{ color: #475569; }}
            .summary {{ background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }}
            .score {{ font-size: 24px; font-weight: bold; color: {'#16a34a' if result.percentage >= 80 else '#eab308' if result.percentage >= 50 else '#dc2626'}; }}
            .question-box {{ margin-bottom: 20px; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; }}
            .correct {{ background: #f0fdf4; border-color: #bbf7d0; }}
            .incorrect {{ background: #fef2f2; border-color: #fecaca; }}
            .label {{ font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>MCQ Test Report</h1>
        <div class="summary">
            <p><strong>Student:</strong> {current_user.email}</p>
            <p class="score">Score: {result.percentage:.1f}% ({result.score} / {result.total_questions})</p>
            <p>Correct: {result.correct_count} | Incorrect: {result.incorrect_count} | Unanswered: {result.unanswered_count}</p>
        </div>
        
        <h2>Detailed Review</h2>
    """
    
    for idx, q in enumerate(result.evaluations):
        box_class = "correct" if q.is_correct else "incorrect"
        icon = "✓" if q.is_correct else "✗"
        
        html_content += f"""
        <div class="question-box {box_class}">
            <h3>{icon} Q{idx+1}: {q.question}</h3>
            <p><span class="label">Your Answer:</span> {q.user_answer or '(Unanswered)'}</p>
        """
        if not q.is_correct:
            html_content += f'<p><span class="label">Correct Answer:</span> {q.correct_answer}</p>'
            
        html_content += f"""
            <div style="margin-top: 10px; background: #fff; padding: 10px; border-radius: 4px;">
                <span class="label">Explanation:</span> {q.explanation}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Bloom's Level: {q.blooms_level}</p>
        </div>
        """
        
    html_content += "</body></html>"
    
    import weasyprint
    
    # Generate PDF in memory using weasyprint (pure Python, doesn't need system binaries like wkhtmltopdf)
    try:
        pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
        return Response(content=pdf_bytes, media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename=MCQ_Report_{result.test_id}.pdf"
        })
    except Exception as e:
        # Fallback to HTML if PDF generation completely fails
        return Response(content=html_content.encode('utf-8'), media_type="text/html", headers={
            "Content-Disposition": f"attachment; filename=MCQ_Report_{result.test_id}.html"
        })
