import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBioSync } from '../../context/BioSyncContext';
import { safeBiosyncApi, biosyncUtils } from '../../services/biosyncApi';

const WellnessAnalytics = () => {
  const { t } = useTranslation();
  const { loading, error, setError } = useBioSync();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    loadAnalytics();
    loadRewards();

    // Set up interval to refresh rewards periodically (every 30 seconds)
    const refreshInterval = setInterval(() => {
      loadRewards();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadRewards = async () => {
    try {
      // Get user's BioSync profile to load challenges and achievements
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/biosync/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const bioSyncData = data.data;

          // Convert active challenges to rewards format for display
          const challengeRewards = bioSyncData.activeChallenges.map(challenge => ({
            id: challenge._id || challenge.challengeId,
            challengeId: challenge.challengeId,
            title: challenge.challengeName,
            points: getChallengePoints(challenge.type),
            badge: getChallengeBadge(challenge.type),
            earnedAt: challenge.startDate,
            type: 'challenge_joined'
          }));

          // Add completed challenges as rewards too
          const completedRewards = bioSyncData.completedChallenges.map(challenge => ({
            id: challenge._id || challenge.challengeId + '_completed',
            challengeId: challenge.challengeId,
            title: challenge.challengeName + ' (Completed)',
            points: getChallengePoints(challenge.type) * 2, // Double points for completion
            badge: getChallengeBadge(challenge.type),
            earnedAt: challenge.completedAt,
            type: 'challenge_completed'
          }));

          setRewards([...challengeRewards, ...completedRewards]);
        }
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      setRewards([]);
    }
  };

  // Helper functions to get challenge points and badges
  const getChallengePoints = (type) => {
    const pointsMap = {
      'gratitude': 100,
      'mindfulness': 200,
      'creativity': 150,
      'movement': 300
    };
    return pointsMap[type] || 100;
  };

  const getChallengeBadge = (type) => {
    const badgeMap = {
      'gratitude': '🏆',
      'mindfulness': '🧘',
      'creativity': '✨',
      'movement': '💪'
    };
    return badgeMap[type] || '🏆';
  };

  const loadAnalytics = async () => {
    if (!biosyncUtils.isAuthenticated()) {
      setError('Please log in to view analytics');
      return;
    }

    try {
      setLocalLoading(true);
      setError(null);

      const response = await safeBiosyncApi.getAnalytics();
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLocalLoading(false);
    }
  };

  if (!biosyncUtils.isAuthenticated()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Authentication Required</h3>
        <p>Please log in to view your wellness analytics.</p>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (localLoading || loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading your wellness analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#f44336', marginBottom: '10px' }}>Error: {error}</div>
        <button
          onClick={loadAnalytics}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#666' }}>No analytics data available yet. Start tracking your mood to see insights!</div>
      </div>
    );
  }

  const {
    overview = {},
    moodDistribution = {},
    recentMoods = [],
    achievements = [],
    meditationStats = {},
    insights: serverInsights = []
  } = analyticsData;

  const {
    totalMoodLogs = 0,
    currentMoodStreak = 0,
    totalMeditationMinutes = 0
  } = overview;

  // Calculate recent trend from recentMoods
  const getRecentTrend = () => {
    if (recentMoods.length < 2) return 'neutral';

    const moodValues = {
      excellent: 5,
      good: 4,
      okay: 3,
      low: 2,
      stressed: 1
    };

    const avgRecent = recentMoods.reduce((sum, entry) => sum + (moodValues[entry.mood] || 3), 0) / recentMoods.length;

    if (avgRecent >= 4) return 'positive';
    if (avgRecent <= 2.5) return 'concerning';
    return 'neutral';
  };

  const recentTrend = getRecentTrend();

  const defaultInsights = [
    {
      title: 'Mood Pattern',
      description: recentTrend === 'positive'
        ? 'Your mood has been trending positively! Keep up the great work.'
        : recentTrend === 'concerning'
        ? 'Your mood seems to need some attention. Consider trying our meditation features.'
        : 'Your mood has been stable. Great job maintaining balance!'
    },
    {
      title: 'Consistency',
      description: totalMoodLogs > 7
        ? 'Excellent consistency in tracking your wellness journey!'
        : totalMoodLogs > 0
        ? `You've logged ${totalMoodLogs} mood entries. Try to log daily for better insights.`
        : 'Start logging your mood daily to get personalized insights!'
    },
    {
      title: 'Wellness Journey',
      description: achievements.length > 0
        ? `You've unlocked ${achievements.length} achievements! Keep building healthy habits.`
        : 'Start your wellness journey to earn achievements and unlock insights!'
    },
    {
      title: 'Growth Opportunity',
      description: totalMeditationMinutes === 0
        ? 'Try our meditation features to enhance your mental wellness.'
        : currentMoodStreak === 0
        ? 'Build a daily mood tracking habit to improve your wellness insights.'
        : 'You\'re doing great! Keep exploring all our wellness features.'
    }
  ];

  const displayInsights = serverInsights.length > 0 ? serverInsights : defaultInsights;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{t('biosync.analytics.title')}</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Track your wellness journey with personalized insights and analytics
      </p>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
          color: 'white',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{totalMoodLogs}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Total Mood Logs</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
          color: 'white',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{currentMoodStreak}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Day Streak</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
          color: 'white',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>
            {achievements.length}
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Achievements</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
          color: 'white',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{Math.round(totalMeditationMinutes)}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Breathing Exercise</p>
        </div>
      </div>

      {/* Mood Distribution */}
      {Object.keys(moodDistribution).length > 0 && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Mood Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
            {Object.entries(moodDistribution).map(([mood, count]) => {
              const moodEmojis = {
                excellent: '😄',
                good: '😊',
                okay: '😐',
                low: '😔',
                stressed: '😰'
              };

              return (
                <div key={mood} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{moodEmojis[mood]}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{count}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'capitalize' }}>{mood}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Personal Insights</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {displayInsights.map((insight, index) => (
            <div key={index} style={{
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '10px',
              borderLeft: '4px solid #00BCD4'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{insight.title}</h4>
              <p style={{ margin: 0, color: '#666' }}>{insight.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge Rewards */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px' }}>🏆 Challenge Rewards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {rewards.length > 0 ? rewards.map((reward, index) => (
            <div
              key={reward.id || index}
              style={{
                padding: '25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '15px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '60px',
                height: '60px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%'
              }}></div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>{reward.badge}</span>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{reward.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                    Joined: {new Date(reward.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  +{reward.points} Points
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  Challenge Reward
                </div>
              </div>
            </div>
          )) : (
            <div style={{
              padding: '40px',
              border: '2px dashed #e0e0e0',
              borderRadius: '15px',
              background: '#f8f9fa',
              textAlign: 'center',
              gridColumn: '1 / -1'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>No Challenge Rewards Yet</h4>
              <p style={{ margin: 0, color: '#666' }}>
                Join wellness challenges to earn points and badges! Visit the Challenges section to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Achievements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          {achievements.length > 0 ? achievements.map((achievement, index) => (
            <div
              key={achievement.id || index}
              style={{
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                background: '#f0f9ff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{achievement.icon || '🏆'}</span>
                <h4 style={{ margin: 0, color: '#2c3e50' }}>{achievement.title}</h4>
                <span style={{ marginLeft: 'auto', color: '#4CAF50' }}>✓</span>
              </div>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{achievement.description}</p>
            </div>
          )) : (
            <div style={{
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              background: '#f8f9fa',
              textAlign: 'center',
              gridColumn: '1 / -1'
            }}>
              <p style={{ margin: 0, color: '#666' }}>No achievements yet. Start tracking your mood to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WellnessAnalytics;
