import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { safeBiosyncApi, biosyncUtils } from '../../services/biosyncApi';
import './MoodTracker.css';

const MoodTracker = ({ onTabChange }) => {
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);

  const moods = [
    { id: 'excellent', emoji: '😄', color: '#4CAF50', label: t('biosync.moodTracker.moods.excellent') },
    { id: 'good', emoji: '😊', color: '#8BC34A', label: t('biosync.moodTracker.moods.good') },
    { id: 'okay', emoji: '😐', color: '#FFC107', label: t('biosync.moodTracker.moods.okay') },
    { id: 'low', emoji: '😔', color: '#FF9800', label: t('biosync.moodTracker.moods.low') },
    { id: 'stressed', emoji: '😰', color: '#F44336', label: t('biosync.moodTracker.moods.stressed') }
  ];

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    if (!biosyncUtils.isAuthenticated()) {
      setError('Please log in to track your mood');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await safeBiosyncApi.getMoodHistory(30);
      if (response.success) {
        setMoodHistory(response.data.moodHistory);
        setCurrentStreak(response.data.currentStreak);
      }
    } catch (err) {
      console.error('Error loading mood history:', err);
      setError('Failed to load mood history');

      // Try to load cached data as fallback
      const cachedData = biosyncUtils.getCachedData('moodHistory');
      if (cachedData) {
        setMoodHistory(cachedData.moodHistory || []);
        setCurrentStreak(cachedData.currentStreak || 0);
      }
    } finally {
      setLoading(false);
    }
  };



  const handleMoodSubmit = async () => {
    if (!selectedMood || loading) return;

    if (!biosyncUtils.isAuthenticated()) {
      setError('Please log in to track your mood');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await safeBiosyncApi.logMood({
        mood: selectedMood,
        notes: '' // Could add notes input later
      });

      if (response.success) {
        // Update local state
        await loadMoodHistory(); // Reload to get updated data

        // Show success message
        setShowSuccess(true);
        setSelectedMood('');

        // Check for new achievements
        if (response.data.newAchievements && response.data.newAchievements.length > 0) {
          setNewAchievements(response.data.newAchievements);
          setTimeout(() => setNewAchievements([]), 5000);
        }

        // Cache the updated data
        biosyncUtils.cacheData('moodHistory', {
          moodHistory,
          currentStreak: response.data.currentStreak
        });

        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error logging mood:', err);
      setError('Failed to log mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTodaysMood = () => {
    const today = new Date().toDateString();
    return moodHistory.find(entry =>
      new Date(entry.date).toDateString() === today
    );
  };

  const handleUpdateMood = async () => {
    const today = new Date().toDateString();
    const updatedHistory = moodHistory.filter(entry =>
      new Date(entry.date).toDateString() !== today
    );
    setMoodHistory(updatedHistory);

    // Also update in database by allowing new mood entry
    // The backend will handle removing today's entry
  };

  const todaysMood = getTodaysMood();

  if (!biosyncUtils.isAuthenticated()) {
    return (
      <div className="mood-tracker">
        <div className="auth-required">
          <h3>Authentication Required</h3>
          <p>Please log in to track your mood and access personalized wellness features.</p>
          <button
            className="login-btn"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-tracker">
      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {/* New Achievements */}
      {newAchievements.length > 0 && (
        <div className="achievement-notification">
          {newAchievements.map((achievement, index) => (
            <div key={index} className="achievement-item">
              <span className="achievement-icon">{achievement.icon}</span>
              <div>
                <strong>{achievement.title}</strong>
                <p>{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mood-header">
        <h2>{t('biosync.moodTracker.title')}</h2>
        <div className="streak-counter">
          <span className="streak-number">{currentStreak}</span>
          <span className="streak-text">{t('biosync.moodTracker.streak', { count: currentStreak })}</span>
        </div>
      </div>

      {todaysMood ? (
        <div className="mood-logged">
          <div className="logged-mood">
            <span className="logged-emoji">
              {moods.find(m => m.id === todaysMood.mood)?.emoji}
            </span>
            <p>You logged your mood as <strong>{moods.find(m => m.id === todaysMood.mood)?.label}</strong> today!</p>
          </div>
          <button
            className="update-mood-btn"
            onClick={handleUpdateMood}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Today\'s Mood'}
          </button>
        </div>
      ) : (
        <div className="mood-selector">
          <h3>{t('biosync.moodTracker.question')}</h3>

          <div className="mood-options">
            {moods.map((mood) => (
              <button
                key={mood.id}
                className={`mood-option ${selectedMood === mood.id ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood.id)}
                style={{ '--mood-color': mood.color }}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>

          <button
            className="submit-mood-btn"
            onClick={handleMoodSubmit}
            disabled={!selectedMood || loading}
          >
            {loading ? 'Logging...' : t('biosync.moodTracker.submit')}
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {t('biosync.moodTracker.success')}
        </div>
      )}

      {/* Recent Mood History */}
      <div className="mood-history">
        <h3>Recent Moods</h3>
        <div className="history-grid">
          {moodHistory.slice(0, 7).map((entry, index) => {
            const mood = moods.find(m => m.id === entry.mood);
            const date = new Date(entry.date);
            return (
              <div key={entry.id || entry._id || `mood-${index}-${entry.date}`} className="history-item">
                <span className="history-emoji">{mood?.emoji}</span>
                <span className="history-date">
                  {date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            );
          })}
        </div>

        {moodHistory.length > 0 && (
          <button
            className="analytics-btn"
            onClick={() => onTabChange && onTabChange('analytics')}
          >
            {t('biosync.moodTracker.analytics')}
          </button>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
