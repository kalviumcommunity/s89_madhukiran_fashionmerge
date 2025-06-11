import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBioSync } from '../../context/BioSyncContext';

const WellnessChallenges = () => {
  const { t } = useTranslation();
  const { joinChallenge: joinChallengeAPI, loading, error } = useBioSync();
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);

  // Load joined challenges from MongoDB backend on component mount
  useEffect(() => {
    loadJoinedChallenges();
  }, []);

  const loadJoinedChallenges = async () => {
    try {
      // Get user's BioSync profile to check active challenges
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/biosync/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.activeChallenges) {
          // Extract challenge IDs from active challenges
          const activeChallengeIds = data.data.activeChallenges.map(challenge => challenge.challengeId);
          setJoinedChallenges(activeChallengeIds);
        }
      }
    } catch (error) {
      console.error('Error loading joined challenges:', error);
      // Fallback to empty array if error
      setJoinedChallenges([]);
    }
  };

  const challenges = [
    {
      id: 'gratitude',
      title: 'Daily Gratitude Practice',
      description: 'Write down 3 things you\'re grateful for each day',
      duration: '7 days',
      participants: 1234,
      reward: '🏆 Gratitude Master Badge',
      points: 100,
      badge: '🏆',
      progress: 0
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness Journey',
      description: 'Practice 5 minutes of mindfulness daily',
      duration: '14 days',
      participants: 856,
      reward: '🧘 Mindful Warrior Badge',
      points: 200,
      badge: '🧘',
      progress: 0
    },
    {
      id: 'creativity',
      title: 'Creative Expression',
      description: 'Create something new every day for a week',
      duration: '7 days',
      participants: 642,
      reward: '✨ Creative Spark Badge',
      points: 150,
      badge: '✨',
      progress: 0
    },
    {
      id: 'movement',
      title: 'Movement & Vitality',
      description: 'Move your body for at least 20 minutes daily',
      duration: '21 days',
      participants: 2156,
      reward: '💪 Movement Master Badge',
      points: 300,
      badge: '💪',
      progress: 0
    }
  ];

  const joinChallenge = async (challengeId) => {
    if (joinedChallenges.includes(challengeId)) return;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    try {
      // Use the MongoDB backend API
      const response = await joinChallengeAPI({
        challengeId: challenge.id,
        challengeName: challenge.title,
        type: challenge.id,
        duration: parseInt(challenge.duration.split(' ')[0]) // Extract number from "7 days"
      });

      if (response.success) {
        // Update joined challenges
        setJoinedChallenges([...joinedChallenges, challengeId]);

        // Create reward object for display
        const newReward = {
          id: Date.now(),
          challengeId: challenge.id,
          title: challenge.title,
          points: challenge.points,
          badge: challenge.badge,
          earnedAt: new Date().toISOString(),
          type: 'challenge_joined'
        };

        // Show grand success message
        setSuccessMessage(`🎉 Congratulations! You've successfully joined the "${challenge.title}" challenge!`);
        setCurrentReward(newReward);
        setShowSuccessModal(true);

        // Auto-hide success modal after 4 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 4000);

        // Refresh the joined challenges list
        setTimeout(() => {
          loadJoinedChallenges();
        }, 1000);

        console.log('Challenge joined successfully:', response);
      } else {
        throw new Error(response.message || 'Failed to join challenge');
      }

    } catch (error) {
      console.error('Error joining challenge:', error);
      setSuccessMessage('❌ Failed to join challenge. Please try again.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      {/* Grand Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '1.8rem' }}>Challenge Joined!</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '1.1rem', opacity: 0.9 }}>
              {successMessage}
            </p>

            {currentReward && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '20px',
                borderRadius: '15px',
                margin: '20px 0'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>🏆 Reward Earned!</h3>
                <div style={{ fontSize: '2rem', margin: '10px 0' }}>{currentReward.badge}</div>
                <p style={{ margin: '5px 0', fontSize: '1rem' }}>{currentReward.title}</p>
                <p style={{ margin: '5px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  +{currentReward.points} Points
                </p>
              </div>
            )}

            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '25px',
                padding: '12px 30px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = 'white';
              }}
            >
              Continue Your Journey
            </button>
          </div>
        </div>
      )}

      <h2>Wellness Challenges</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Join wellness challenges and build healthy habits with our community
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {challenges.map((challenge) => {
          const isJoined = joinedChallenges.includes(challenge.id);

          return (
            <div
              key={challenge.id}
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease'
              }}
            >
              <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>{challenge.title}</h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>{challenge.description}</p>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Duration: {challenge.duration}</span>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>{challenge.participants} participants</span>
                </div>

                {isJoined && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.9rem' }}>Progress</span>
                      <span style={{ fontSize: '0.9rem' }}>{challenge.progress}%</span>
                    </div>
                    <div style={{
                      background: '#e0e0e0',
                      borderRadius: '10px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: 'linear-gradient(90deg, #00BCD4, #26C6DA)',
                        height: '100%',
                        width: `${challenge.progress}%`,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                {t('biosync.challenges.reward')}: {challenge.reward}
              </div>

              <button
                onClick={() => joinChallenge(challenge.id)}
                disabled={isJoined}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '25px',
                  background: isJoined ? '#4CAF50' : '#00BCD4',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: isJoined ? 'default' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {isJoined ? '✓ Joined' : t('biosync.challenges.join')}
              </button>
            </div>
          );
        })}
      </div>

      {joinedChallenges.length > 0 && (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3>Your Active Challenges</h3>
          <p style={{ color: '#666' }}>
            You're participating in {joinedChallenges.length} challenge{joinedChallenges.length !== 1 ? 's' : ''}. Keep going! 🌟
          </p>
        </div>
      )}
    </div>
  );
};

export default WellnessChallenges;
