import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/NavBar';
import MoodTracker from '../components/biosync/MoodTracker';
import MeditationHub from '../components/biosync/MeditationHub';
import InspirationFeed from '../components/biosync/InspirationFeed';
import WellnessChallenges from '../components/biosync/WellnessChallenges';
import WellnessAnalytics from '../components/biosync/WellnessAnalytics';
import { BioSyncProvider } from '../context/BioSyncContext';
import './BioSync.css';

const BioSync = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('mood');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 100);
    };

    // Store original body styles
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;

    // Ensure body has no margins/padding for full viewport
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Reset body styles when component unmounts
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
    };
  }, []);

  const tabs = [
    { id: 'mood', label: t('biosync.moodTracker.title'), icon: '😊' },
    { id: 'meditation', label: t('biosync.meditation.title'), icon: '🧘' },
    { id: 'inspiration', label: t('biosync.inspiration.title'), icon: '✨' },
    { id: 'challenges', label: t('biosync.challenges.title'), icon: '🎯' },
    { id: 'analytics', label: t('biosync.analytics.title'), icon: '📊' }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'mood':
        return <MoodTracker onTabChange={setActiveTab} />;
      case 'meditation':
        return <MeditationHub />;
      case 'inspiration':
        return <InspirationFeed />;
      case 'challenges':
        return <WellnessChallenges />;
      case 'analytics':
        return <WellnessAnalytics />;
      default:
        return <MoodTracker onTabChange={setActiveTab} />;
    }
  };

  return (
    <BioSyncProvider>
      <div className="biosync-page">
        <Navbar scrolled={scrolled} />

        {/* Hero Section */}
        <section className="biosync-hero">
          <div className="hero-content">
            <img
              src="https://res.cloudinary.com/dwr6mvypn/image/upload/v1748843633/craiyon_112133_image_1_1_ctc6rz.png"
              alt="BioSync Wellness Hub"
              className="biosync-hero-image"
            />
            <p className="hero-subtitle">{t('biosync.subtitle')}</p>
            <p className="hero-description">{t('biosync.description')}</p>
          </div>
          <div className="hero-background">
            <div className="floating-elements">
              <div className="floating-element">🌱</div>
              <div className="floating-element">✨</div>
              <div className="floating-element">🧘</div>
              <div className="floating-element">💚</div>
              <div className="floating-element">🌸</div>
            </div>
          </div>
        </section>

      {/* Features Overview */}
      <section className="features-overview">
        <div className="biosync-container">
          <h2>Wellness Features</h2>
          <div className="features-grid">
            <div className="biosync-feature-card">
              <div className="biosync-feature-icon">😊</div>
              <h3>{t('biosync.features.moodTracking')}</h3>
              <p>Track your daily emotions and build insights into your mental wellness patterns.</p>
            </div>
            <div className="biosync-feature-card">
              <div className="biosync-feature-icon">🧘</div>
              <h3>{t('biosync.features.meditation')}</h3>
              <p>Access guided meditations and breathing exercises for every moment of your day.</p>
            </div>
            <div className="biosync-feature-card">
              <div className="biosync-feature-icon">✨</div>
              <h3>{t('biosync.features.inspiration')}</h3>
              <p>Discover daily quotes, stories, and creative prompts to spark your imagination.</p>
            </div>
            <div className="biosync-feature-card">
              <div className="biosync-feature-icon">🎯</div>
              <h3>{t('biosync.features.challenges')}</h3>
              <p>Join wellness challenges and earn rewards for building healthy habits.</p>
            </div>
            <div className="biosync-feature-card">
              <div className="biosync-feature-icon">📊</div>
              <h3>Analytics & Insights</h3>
              <p>Visualize your wellness journey with personalized analytics and trends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="biosync-main">
        <div className="biosync-container">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Component */}
          <div className="tab-content">
            {renderActiveComponent()}
          </div>
        </div>
      </section>
      </div>
    </BioSyncProvider>
  );
};

export default BioSync;
