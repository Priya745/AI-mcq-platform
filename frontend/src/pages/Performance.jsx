import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Performance() {
  const [data, setData] = useState({ performance: [], recommendations: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getAccuracyColor = (acc) => {
    if (acc >= 80) return '#16a34a';
    if (acc >= 50) return '#ca8a04';
    return '#dc2626';
  };

  const getRecColor = (type) => {
    if (type === 'Advance') return '#dcfce7';
    if (type === 'Practice More') return '#fef08a';
    return '#fecaca';
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Performance Analytics</h1>
        <button className="btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Topic Mastery</h2>
          {data.performance.length === 0 ? (
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>No performance data available yet. Take a test first!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {data.performance.map((perf, i) => (
                <div key={i} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>{perf.subject}</div>
                  <h3 style={{ margin: '0.5rem 0' }}>{perf.topic}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Accuracy</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getAccuracyColor(perf.accuracy) }}>
                        {perf.accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
                      {perf.correct_answers} / {perf.questions_attempted} correct
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Personalized Recommendations</h2>
          {data.recommendations.length === 0 ? (
            <p style={{ color: '#64748b' }}>No recommendations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: getRecColor(rec.recommendation_type), borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0 }}>{rec.recommended_topic} ({rec.subject})</h3>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{rec.recommendation_type}</span>
                    </div>
                    <p style={{ margin: 0, color: '#334155' }}>{rec.reason}</p>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Issued on: {rec.created_at}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Performance;
