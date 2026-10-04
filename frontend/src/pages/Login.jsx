import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // Typically login uses form-urlencoded in FastAPI depending on OAuth2PasswordRequestForm
      // But the instructions specify: "Send credentials as JSON to POST /api/v1/auth/login."
      // I will send it as JSON as requested.
      const response = await api.post('/auth/login', formData);
      const { access_token, token_type } = response.data;
      
      localStorage.setItem('access_token', access_token);
      if (token_type) {
        localStorage.setItem('token_type', token_type);
      }
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response && err.response.data && err.response.data.detail) {
        if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail);
        } else if (Array.isArray(err.response.data.detail)) {
          const errorMessages = err.response.data.detail.map(
            (errItem) => `${errItem.loc[errItem.loc.length - 1]}: ${errItem.msg}`
          );
          setError(errorMessages.join(', '));
        } else {
          setError('Invalid email or password.');
        }
      } else {
        setError('A network or server error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container auth-form">
      <h2 className="page-title" style={{ textAlign: 'center' }}>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
