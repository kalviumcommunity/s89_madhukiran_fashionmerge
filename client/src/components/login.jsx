import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css';
import { AUTH_ENDPOINTS } from '../config/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for error parameter in URL
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Authentication error. Please try again.');
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      console.log('User is already logged in, redirecting to home');
      navigate('/home');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(AUTH_ENDPOINTS.LOGIN, formData);
      setSuccess(res.data.msg || 'Login successful!');

      if (res.status === 200) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId);

        // Trigger storage event for other components to detect the change
        window.dispatchEvent(new Event('storage'));

        console.log('Login successful! User ID:', res.data.userId);

        setTimeout(() => {
          navigate('/home');
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || 'Login failed');
      } else {
        console.error(error);
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email: forgotPasswordEmail });
      setSuccess(res.data.msg || 'Password reset link sent!');

      // Automatically clear the success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || 'Failed to send reset link');
      } else {
        console.error(error);
        setError('An error occurred. Please try again.');
      }
    }
  };

  const redirectToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="signup-container">
      <div className="left-panel">
        <div className="welcome-content">
          <br />
          <br />
          <br />
          <br />
          <h1>Welcome Back!</h1>
          <p style={{ fontFamily: '"Lucida Handwriting", cursive', fontSize: '1rem' }}>
          Sign in to access your account and continue your fashion journey with us.
    </p>
          <button onClick={redirectToSignup} className="signin-button">
            Don't have an account? Sign up.
          </button>
        </div>
      </div>

      <div className="right-panel">
        <div className="form-container" style={{ position: 'relative' }}>
          {success && <div className="success-message">{success}</div>}
          <div className="form-header">
            <h2>{showForgotPassword ? 'Reset Password' : 'Sign In'}</h2>
          </div>

          {error && <div className="error-message">{error}</div>}


          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="signup-form">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="form-input"
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="form-input"
              />

              <div className="form-footer">
                <div className="terms-container">
                  <input type="checkbox" id="remember" className="terms-checkbox" />
                  <label htmlFor="remember" className="terms-text">Remember me</label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgotPassword(true);
                    }}
                    className="forgot-password-link"
                  >
                    Forgot Password?
                  </a>
                </div>
                <button type="submit" className="signup-button">Login</button>
                <div className="social-icons">
                  <p className="or-text">or</p>
                  <a href={AUTH_ENDPOINTS.GOOGLE_AUTH} className="google-icon-link">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/281/281764.png"
                      alt="Google logo"
                      className="google-icon-only"
                    />
                  </a>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="signup-form">
              <input
                type="email"
                name="forgotPasswordEmail"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="form-input"
              />

              <div className="form-footer">
                <button type="submit" className="signup-button">Send Reset Link</button>
                <p className="back-to-login">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgotPassword(false);
                    }}
                  >
                    Back to Login
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;