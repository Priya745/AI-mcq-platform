import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ActiveTest from '../components/ActiveTest';

function Test() {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'Medium',
    question_count: 5,
    time_limit_minutes: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Ephemeral test state
  const [activeTest, setActiveTest] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'question_count' || name === 'time_limit_minutes' ? parseInt(value) || 0 : value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.subject || !formData.topic || formData.question_count <= 0) {
      setError('Please fill out all required fields with valid values.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/tests/generate', formData);
      // The backend returns { test_id, questions } without the correct answers
      setActiveTest({
        testId: response.data.test_id,
        questions: response.data.questions,
        timeLimit: formData.time_limit_minutes
      });
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The AI took too long to generate questions. Please try again.');
      } else {
        setError(err.response?.data?.detail || 'A network error occurred. Ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (activeTest) {
    return (
      <ActiveTest 
        testId={activeTest.testId} 
        questions={activeTest.questions} 
        timeLimit={activeTest.timeLimit} 
      />
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="page-title">Generate a New Test</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Configure your parameters below to generate personalized multiple-choice questions using AI.
      </p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleGenerate} className="auth-form" style={{ maxWidth: '100%' }}>
        <div className="form-group">
          <label>Subject</label>
          <input 
            type="text" 
            name="subject"
            placeholder="e.g., Computer Science" 
            className="form-control"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Topic</label>
          <input 
            type="text" 
            name="topic"
            placeholder="e.g., React Hooks" 
            className="form-control"
            value={formData.topic}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="form-control">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label>Number of Questions</label>
          <input 
            type="number" 
            name="question_count"
            min="1"
            max="50"
            className="form-control"
            value={formData.question_count}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Duration</label>
          <select name="time_limit_minutes" value={formData.time_limit_minutes} onChange={handleChange} className="form-control">
            <option value="0">No limit</option>
            <option value="10">10 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
          </select>
        </div>
        
        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Generating with AI...' : 'Generate Questions'}
        </button>
      </form>
    </div>
  );
}

export default Test;
