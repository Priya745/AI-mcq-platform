import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function TestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <h2>No test results found</h2>
        <button className="btn" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const { score, total_questions, percentage, evaluations, test_id } = result;
  
  const getScoreColor = (pct) => {
    if (pct >= 80) return '#22c55e';
    if (pct >= 50) return '#eab308';
    return '#ef4444';
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.post('/pdf/generate', result, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Determine filename based on content type returned
      const contentDisposition = response.headers['content-disposition'];
      let filename = `MCQ_Report_${test_id}.pdf`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate PDF. Make sure you are logged in.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Test Complete</h1>
      
      <div style={{
        background: '#f8fafc',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: getScoreColor(percentage) }}>
          {percentage.toFixed(1)}%
        </div>
        <div style={{ fontSize: '1.2rem', color: '#64748b' }}>
          You scored {score} out of {total_questions}
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          <button className="btn" style={{ background: '#3b82f6' }} onClick={handleDownloadPDF}>Download PDF Report</button>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Detailed Review</h2>
      
      <div>
        {evaluations.map((ev, idx) => (
          <div key={idx} style={{ 
            marginBottom: '1.5rem', 
            padding: '1.5rem', 
            border: '1px solid',
            borderColor: ev.is_correct ? '#bbf7d0' : '#fecaca',
            borderRadius: '8px',
            background: ev.is_correct ? '#f0fdf4' : '#fef2f2'
          }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: ev.is_correct ? '#16a34a' : '#dc2626' }}>
                {ev.is_correct ? '✓' : '✗'}
              </span>
              Q{idx + 1}: {ev.question}
            </h3>
            
            <div style={{ marginLeft: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold' }}>Your Answer: </span>
                <span style={{ color: ev.user_answer === ev.correct_answer ? '#16a34a' : '#dc2626' }}>
                  {ev.user_answer || '(Unanswered)'}
                </span>
              </div>
              
              {!ev.is_correct && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Correct Answer: </span>
                  <span style={{ color: '#16a34a' }}>{ev.correct_answer}</span>
                </div>
              )}
              
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Explanation:</strong>
                {ev.explanation}
              </div>
              
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                Bloom's Level: {ev.blooms_level}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestResult;
