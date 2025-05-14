import React, { useState } from 'react';
import axios from 'axios';
import './signup.css';
import { useNavigate } from 'react-router-dom';
import { AUTH_ENDPOINTS } from '../config/api';

const SignupForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const dataToSend = {
            username: formData.username,
            email: formData.email,
            password: formData.password
        };

        console.log('Form Data:', dataToSend); // Keep your existing debugging

        try {
            const res = await axios.post(AUTH_ENDPOINTS.SIGNUP, dataToSend);
            setSuccess(res.data.msg || 'Signup successful!');

            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Error Response:', error.response?.data); // Keep your existing debugging
            if (error.response) {
                setError(error.response.data.msg);
            } else {
                setError('Something went wrong, please try again.');
            }
        }
    };

    const redirectToLogin = () => {
        navigate('/login');
    };

    return (
        <div
        className="signup-container">
            <div className="left-panel">
                <div className="welcome-content">
                    <br />
                    <br />
                    <br />
                    <br />
                    <h1>Come join us!</h1>
                    <p style={{ fontFamily: '"Lucida Handwriting", cursive', fontSize: '1rem' }}>
                    We are so excited to have you here. If you haven't already, create an account to get access to exclusive offers, rewards, and discounts
    </p>
                    <button onClick={redirectToLogin} className="signin-button">
                        Already have an account? Signin.
                    </button>
                </div>
            </div>

            <div className="right-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Sign Up</h2>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmit} className="signup-form">
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Name"
                            required
                            className="form-input"
                        />

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

                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-type Password"
                            required
                            className="form-input"
                        />


                        <div className="form-footer">
                            <div className="terms-container">
                                <input type="checkbox" id="terms" required className="terms-checkbox" />
                                <label htmlFor="terms" className="terms-text">I agree to the terms and conditions</label>
                            </div>
                            <button type="submit" className="signup-button">Register</button>
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
                            <div className="social-icons"></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;