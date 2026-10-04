import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Test from './pages/Test';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestResult from './pages/TestResult';
import History from './pages/History';
import Performance from './pages/Performance';
import api from './api/axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Re-check authentication status whenever the route changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          // Token invalid or expired
          setUser(null);
          localStorage.removeItem('access_token');
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">AI MCQ Generator</div>
        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          
          {user ? (
            <>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/test">Take a Test</Link>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register">Sign Up</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/result" element={<TestResult />} />
          <Route path="/history" element={<History />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </main>
      
      <footer className="footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem' }}>
        <p>&copy; 2026 AI MCQ Platform. All rights reserved.</p>
        {user && <p style={{ fontWeight: 'bold' }}>Logged in as: {user.name || user.email}</p>}
      </footer>
    </div>
  );
}

export default App;
