import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css'; // Import the CSS file for styling

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Handle token from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token); // Store token in local storage
      navigate('/home'); // Redirect to home page
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', formData);
      alert(res.data.msg);

      if (res.status === 200) {
        // Store the JWT token in local storage
        localStorage.setItem('token', res.data.token);

        // Redirect to the home page
        navigate('/home');
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.msg);
      } else {
        console.error(error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/forgot-password', { email: forgotPasswordEmail });
      alert(res.data.msg);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.msg);
      } else {
        console.error(error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Welcome to Your Fashion Journey</h1>
        <p>Connect with the latest trends and unlock your style potential.</p>
      </div>
      <div className="login-right">
        {!showForgotPassword ? (
          <>
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details</p>
            <form onSubmit={handleSubmit}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="login-options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" onClick={() => setShowForgotPassword(true)}>
                  Forgot Password?
                </a>
              </div>
              <button type="submit">Continue</button>
            </form>
            <div className="google-signup">
              <p>Or</p>
              <a href="http://localhost:5000/auth/google">
                <button className="google-button">Sign In with Google</button>
              </a>
            </div>
          </>
        ) : (
          <>
            <h2>Forgot Password</h2>
            <p>Enter your email to reset your password</p>
            <form onSubmit={handleForgotPasswordSubmit}>
              <label>Email Address</label>
              <input
                type="email"
                name="forgotPasswordEmail"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
              <button type="submit">Send Reset Link</button>
            </form>
            <p>
              Remembered your password?{' '}
              <a href="#" onClick={() => setShowForgotPassword(false)}>
                Go back to login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;