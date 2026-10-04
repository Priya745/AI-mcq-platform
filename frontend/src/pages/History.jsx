import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/tests/history');
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getScoreColor = (pct) => {
    if (pct >= 80) return '#16a34a';
    if (pct >= 50) return '#ca8a04';
    return '#dc2626';
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Test History</h1>
        <button className="btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>

      {loading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '8px' }}>
          <h3>No tests taken yet</h3>
          <p>Generate a new test to see your history here.</p>
          <button className="btn" style={{ marginTop: '1rem' }} onClick={() => navigate('/test')}>Generate Test</button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Subject</th>
                <th style={{ padding: '1rem' }}>Topic</th>
                <th style={{ padding: '1rem' }}>Difficulty</th>
                <th style={{ padding: '1rem' }}>Score</th>
                <th style={{ padding: '1rem' }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {history.map((test) => (
                <tr key={test.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>{test.completed_at}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{test.subject}</td>
                  <td style={{ padding: '1rem' }}>{test.topics}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.85rem',
                      background: test.difficulty === 'Easy' ? '#dcfce7' : (test.difficulty === 'Medium' ? '#fef08a' : '#fecaca'),
                      color: test.difficulty === 'Easy' ? '#166534' : (test.difficulty === 'Medium' ? '#854d0e' : '#991b1b')
                    }}>
                      {test.difficulty}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{test.score} / {test.question_count}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: getScoreColor(test.percentage) }}>
                    {test.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
