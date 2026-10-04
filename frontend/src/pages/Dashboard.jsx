import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user', err);
        // If 401 Unauthorized, token is likely expired or missing
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  if (loading) {
    return <div className="page-container"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Welcome, {user?.name || 'User'}!</h1>
        <button className="btn" style={{ background: '#ef4444' }} onClick={handleLogout}>Logout</button>
      </div>
      
      <p style={{ marginBottom: '2rem', color: '#64748b' }}>
        Here you can generate AI tests, view your past history, and track your performance.
      </p>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          className="btn" 
          onClick={() => navigate('/test')}
          style={{ flex: 1, padding: '1.5rem', fontSize: '1.2rem', background: '#3b82f6' }}
        >
          Generate New MCQ Test
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div 
          onClick={() => navigate('/history')}
          style={{ 
            padding: '2rem', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: '#f8fafc'
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Test History</h2>
          <p style={{ color: '#64748b' }}>Review past tests, scores, and download PDF reports.</p>
        </div>
        
        <div 
          onClick={() => navigate('/performance')}
          style={{ 
            padding: '2rem', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: '#f8fafc'
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Performance Analytics</h2>
          <p style={{ color: '#64748b' }}>Track your mastery across topics and see personalized recommendations.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
