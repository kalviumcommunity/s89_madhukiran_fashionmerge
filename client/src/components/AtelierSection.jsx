import React from 'react';
import { useTranslation } from 'react-i18next';
import './AtelierSection.css';

const AtelierSection = () => {
  const { t } = useTranslation();

  const handleExploreAlitaClick = () => {
    window.location.href = '/alita'; // Redirect to the chatbot page
  };

  return (
    <section className="atelier-section">
      <div className="atelier-grid">
        <div className="atelier-text">
          <h2>{t('alita.title')}</h2>
          <div className="atelier-paragraph">
            <p>{t('alita.description')}</p>
          </div>
          <a href="#craftsmanship" className="craft-btn" onClick={handleExploreAlitaClick}>
            {t('alita.exploreButton')}
          </a>
        </div>
        <div className="atelier-image">
          <img src="https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg" alt="Jewelry craftsmanship" />
        </div>
      </div>
    </section>
  );
};

export default AtelierSection;
