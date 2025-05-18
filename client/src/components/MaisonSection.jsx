import React from 'react';
import { useTranslation } from 'react-i18next';
import './MaisonSection.css';

const MaisonSection = () => {
  const { t } = useTranslation();
  
  const handleDiscoverMoreClick = () => {
    window.location.href = '/collections'; // Redirect to the discover page
  };

  return (
    <section className="maison-section">
      <video className="maison-video" autoPlay loop muted>
        <source src="https://res.cloudinary.com/dwr6mvypn/video/upload/v1747396676/klzqqfpkl8kjfrtamg1v.mp4" />
        {t('maison.videoAlt')}
      </video>
      <div className="maison-content">
        <h2>{t('maison.title')}</h2>
        <p>{t('maison.description')}</p>
        <a href="#discover" className="discover-btn" onClick={handleDiscoverMoreClick}>
          {t('maison.button')}
        </a>
      </div>
    </section>
  );
};

export default MaisonSection;
