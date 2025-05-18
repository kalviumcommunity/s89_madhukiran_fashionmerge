import React from 'react';
import { useTranslation } from 'react-i18next';
import './About.css';

const About = () => {
  const { t } = useTranslation();

  const handleLearnMoreClick = () => {
    window.location.href = '/about'; // Redirect to the about us page
  };

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-content">
          <div className="about-image">
            <img
              src="https://images.pexels.com/photos/6069552/pexels-photo-6069552.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Fashion design studio"
              className="image"
            />
          </div>

          <div className="about-text">
            <h2 className="title">{t('about.homeStory')}</h2>

            <p className="description">
              <br />
              {t('about.homeStoryText1')}
            </p>
            <p className="description">
              {t('about.homeStoryText2')}
            </p>
            <button className="learn-more-btn" onClick={handleLearnMoreClick}>
              {t('about.learnMoreButton')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;