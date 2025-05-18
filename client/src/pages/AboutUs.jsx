import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { useTranslation } from 'react-i18next';
import Navbar from '../components/NavBar'; // Ensure this path is correct
import './AboutUs.css';

const AboutUs = () => {
  const [scrolled, setScrolled] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = 100;
      setScrolled(scrollTop > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="about">
      <Navbar scrolled={scrolled} />
      <section className={`about-us-section ${scrolled ? 'scrolled' : 'white'}`}>
        <div className="about-us-container">
          <div className="about-us-text">
            <h1 className="about-us-title">{t('about.ourMission')}</h1>
            <p className="about-us-description">
              {t('about.missionText')}
            </p>
          </div>
          <div className="about-us-image">
            <img
              src="https://plus.unsplash.com/premium_photo-1661962766454-57c02128ded3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDMyfHx8ZW58MHx8fHx8"
              alt="Fashion Merge Team"
              className="image"
            />
          </div>
        </div>
        <div className="about-us-container reverse">
          <div className="about-us-image">
            <img
              src="https://images.pexels.com/photos/6069552/pexels-photo-6069552.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Fashion Merge Team"
              className="image"
            />
          </div>
          <div className="about-us-text">
            <h1 className="about-us-title">{t('about.ourStory')}</h1>
            <p className="about-us-description">
              {t('about.storyText')}
            </p>
          </div>
        </div>
        <div className="about-us-container">
          <div className="about-us-text">
            <h1 className="about-us-title">{t('about.whoAmI')}</h1>
            <p className="about-us-description">
              {t('about.whoAmIText')}
            </p>
            <button className="contact-btn" onClick={() => navigate('/contact')}>
              {t('about.contactButton')}
            </button>
          </div>
          <div className="about-us-image">
            <img
              src="https://plus.unsplash.com/premium_photo-1675081853634-54e2897df4ff?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dW5rbm93bnxlbnwwfHwwfHx8MA%3D%3D"
              alt="Fashion Merge Team"
              className="image"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
