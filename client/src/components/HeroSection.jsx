import React from 'react';
import { useTranslation } from 'react-i18next';
import './HeroSection.css';

const HeroSection = () => {
  const { t } = useTranslation();

  const handleDiscoverClick = () => {
    window.location.href = '/signup'; // Redirect to the signup page
  };

  return (
    <section
      id="home-section"
      className="hero-section">
      <div className="hero-left">
        <div className="hero-content">
          <h1>{t('home.heroTitle')}</h1>
          <div className="divider"></div>
          <p>{t('home.heroSubtitle')}</p>
          <button className="discover-btn" onClick={handleDiscoverClick}>{t('home.exploreButton')}</button>
        </div>
      </div>
      <div className="hero-right">
        <img
          src="https://images.unsplash.com/photo-1692178573107-8f5dae7b6d31?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Fashion model in elegant outfit"
          className="hero-image"
        />
        <div className="overlay"></div>
      </div>
    </section>
  );
};

export default HeroSection;