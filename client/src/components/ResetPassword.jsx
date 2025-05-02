import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './signup.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const token = searchParams.get('token');
      console.log('Token being sent:', token);
      const res = await axios.put('http://localhost:5000/reset-password', {
        token,
        password,
      });
      setSuccess(res.data.msg);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="signup-container">
      <div className="left-panel">
        <div className="welcome-content">
          <br />
          <br />
          <br />
          <br />
          <h1>Reset Your Password</h1>
          <p style={{ fontFamily: '"Lucida Handwriting", cursive', fontSize: '1rem' }}>
          Create a new password to secure your account.    </p>          <button onClick={redirectToLogin} className="signin-button">
            Back to Login
          </button>
        </div>
      </div>
      
      <div className="right-panel">
        <div className="form-container">
          <div className="form-header">
            <h2>Create New Password</h2>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
              className="form-input"
            />
            
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="form-input"
            />
            
            <div className="form-footer">
              <button type="submit" className="signup-button">Reset Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;