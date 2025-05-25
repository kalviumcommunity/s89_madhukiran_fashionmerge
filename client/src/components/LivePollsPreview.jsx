import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LivePollsPreview.css';

const LivePollsPreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Handle explore polls
  const handleExplorePolls = () => {
    navigate('/polls');
  };

  return (
    <section className="live-polls-preview">
      <div className="polls-preview-container">
        <div className="polls-preview-header">
          <h2>
            <span className="live-dot"></span>
            {t('polls.livePolls')}
          </h2>
          <p className="polls-preview-subtitle">
            {t('polls.discoverTrending')}
          </p>
        </div>

        <div className="polls-info-content">
          <div className="polls-info-image">
            <img
              src="https://res.cloudinary.com/dwr6mvypn/image/upload/v1747330497/cld-sample-5.png"
              alt="Live Polls"
              className="polls-image"
            />
          </div>
          <div className="polls-info-text">
            <h3 className="polls-info-title">{t('polls.joinCommunity')}</h3>
            <p className="polls-info-description">
              {t('polls.communityDescription')}
            </p>
            <button className="explore-polls-btn" onClick={handleExplorePolls}>
              {t('polls.explorePolls')}
            </button>
          </div>
        </div>


      </div>
    </section>
  );
};

export default LivePollsPreview;
