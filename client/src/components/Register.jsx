import React, { useState } from 'react';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirect to signup page
    window.location.href = '/signup';
  };

  return (
    <section className="register-section">
      <div className="register-container">
        <h2 className="register-title">JOIN OUR WORLD</h2>
        <div className="divider"></div>
        <p className="register-description">
          Register to our newsletter to receive exclusive updates, early access to new collections, 
          and curated style insights delivered directly to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="register-input"
          />
          <button 
            type="submit"
            className="register-button"
          >
            REGISTER
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;