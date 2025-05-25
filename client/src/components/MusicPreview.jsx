import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './MusicPreview.css';

const MusicPreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Handle explore music
  const handleExploreMusic = () => {
    navigate('/music');
  };

  return (
    <section className="music-preview">
      <div className="music-preview-container">
        <div className="music-preview-header">
          <h2>
            <span className="music-dot"></span>
            {t('music.title')}
          </h2>
          <p className="music-preview-subtitle">
            {t('music.discoverMusic')}
          </p>
        </div>

        <div className="music-info-content">
          <div className="music-info-image">
            <img
              src="https://i.pinimg.com/736x/5f/fb/60/5ffb607bef228588560803c379b0f7ee.jpg"
              alt="Fashion Music"
              className="music-image"
            />
          </div>
          <div className="music-info-text">
            <h3 className="music-info-title">{t('music.joinMusicCommunity')}</h3>
            <p className="music-info-description">
              {t('music.communityDescription')}
            </p>
            <button className="explore-music-btn" onClick={handleExploreMusic}>
              {t('music.exploreMusic')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MusicPreview;
