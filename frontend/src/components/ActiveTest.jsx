import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ActiveTest({ testId, questions, timeLimit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLimit === 0) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, timeLimit]);

  const handleOptionSelect = (option) => {
    setAnswers({
      ...answers,
      [currentIndex]: option
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const payload = {
        questions: questions,
        user_answers: answers
      };
      // We pass the full questions back statelessly so the backend can evaluate
      const response = await api.post(`/tests/${testId}/submit`, payload);
      
      // Store result in memory/router state and go to result page
      navigate('/result', { state: { result: response.data } });
    } catch (err) {
      alert('Error submitting test: ' + (err.response?.data?.detail || err.message));
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Question {currentIndex + 1} of {questions.length}</h1>
        {timeLimit > 0 && (
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft < 60 ? 'red' : 'inherit' }}>
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', minHeight: '300px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{currentQ.question}</h2>
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
          Bloom's Level: {currentQ.blooms_level}
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {currentQ.options.map((opt, i) => (
            <li 
              key={i} 
              onClick={() => handleOptionSelect(opt)}
              style={{
                padding: '1rem',
                margin: '1rem 0',
                border: '1px solid',
                borderColor: answers[currentIndex] === opt ? 'var(--primary-color)' : '#ddd',
                borderRadius: '8px',
                backgroundColor: answers[currentIndex] === opt ? '#eff6ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="radio" 
                  checked={answers[currentIndex] === opt} 
                  onChange={() => {}} 
                  style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>{opt}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button 
          className="btn" 
          style={{ background: '#666' }}
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || submitting}
        >
          Previous
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button 
            className="btn" 
            style={{ background: '#22c55e' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to submit your test?')) {
                handleSubmit();
              }
            }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        ) : (
          <button 
            className="btn" 
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={submitting}
          >
            Next
          </button>
        )}
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              background: currentIndex === idx ? 'var(--primary-color)' : (answers[idx] ? '#93c5fd' : '#eee'),
              color: currentIndex === idx ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ActiveTest;
