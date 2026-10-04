import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container">
      <h1 className="page-title">Welcome to AI MCQ Generator</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Generate personalized multiple-choice questions instantly using the power of AI. 
        Test your knowledge and improve your learning efficiently.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/test" className="btn">Get Started</Link>
      </div>
    </div>
  );
}

export default Home;
