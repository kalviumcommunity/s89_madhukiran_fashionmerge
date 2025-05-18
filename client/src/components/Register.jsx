import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();

    window.location.href = '/signup';
  };

  return (
    <section className="register-section">
      <div className="register-container">
        <h2 className="register-title">{t('register.title')}</h2>
        <div className="divider"></div>
        <p className="register-description">
          {t('register.description')}
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('register.emailPlaceholder')}
            required
            className="register-input"
          />
          <button
            type="submit"
            className="register-button"
          >
            {t('register.button')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;