import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useBioSync } from '../../context/BioSyncContext';
import { biosyncUtils } from '../../services/biosyncApi';
import './MeditationHub.css';

const MeditationHub = () => {
  const { t } = useTranslation();
  const { logMeditationSession, setError } = useBioSync();

  // Session state
  const [selectedCategory, setSelectedCategory] = useState('fashion');
  const [selectedMeditation, setSelectedMeditation] = useState(null);

  // Session state
  const [sessionStarted, setSessionStarted] = useState(false);

  // Breathing exercise state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale', 'hold', 'exhale'
  const [breathCount, setBreathCount] = useState(0);
  const [breathingDuration, setBreathingDuration] = useState(0); // Total breathing time in seconds
  const [breathingStartTime, setBreathingStartTime] = useState(null);

  // Refs
  const breathingRef = useRef(null);

  const categories = [
    { id: 'fashion', label: 'Fashion & Style', icon: '👗' },
    { id: 'meditation', label: 'Mindfulness', icon: '🧘' },
    { id: 'personality', label: 'Personality Growth', icon: '✨' },
    { id: 'confidence', label: 'Confidence Building', icon: '💪' },
    { id: 'lifestyle', label: 'Lifestyle & Wellness', icon: '🌿' }
  ];



  const meditations = {
    fashion: [
      {
        id: 1,
        title: 'Fashion Psychology & Personal Style',
        description: 'Discover how fashion impacts your confidence and personal brand.',
        youtubeId: 'Ks-_Mh1QhMc',
        duration: '12 minutes'
      },
      {
        id: 2,
        title: 'Style Confidence & Self Expression',
        description: 'Learn how to express your authentic self through fashion choices.',
        youtubeId: 'Q0ICIxo0YEo',
        duration: '15 minutes'
      }
    ],
    meditation: [
      {
        id: 3,
        title: 'Mindfulness for Daily Life',
        description: 'Practical mindfulness techniques to enhance your everyday experiences.',
        youtubeId: 'ZToicYcHIOU',
        duration: '10 minutes'
      },
      {
        id: 4,
        title: '10 Minute Guided Meditation',
        description: 'A peaceful guided meditation for stress relief and relaxation.',
        youtubeId: 'U9YKY7fdwyg',
        duration: '18 minutes'
      }
    ],
    personality: [
      {
        id: 5,
        title: 'Developing Charisma & Presence',
        description: 'Build magnetic personality traits that attract success and relationships.',
        youtubeId: 'w-HYZv6HzAs',
        duration: '20 minutes'
      },
      {
        id: 6,
        title: 'How to Be More Confident',
        description: 'Practical tips to boost your confidence and social skills.',
        youtubeId: 'l_NYrWqUR40',
        duration: '25 minutes'
      }
    ],
    confidence: [
      {
        id: 7,
        title: 'Building Unshakeable Confidence',
        description: 'Develop rock-solid confidence that transforms how you show up in the world.',
        youtubeId: 'l_NYrWqUR40',
        duration: '16 minutes'
      },
      {
        id: 8,
        title: 'Self-Confidence Techniques',
        description: 'Evidence-based methods to build lasting self-confidence.',
        youtubeId: 'w-HYZv6HzAs',
        duration: '14 minutes'
      }
    ],
    lifestyle: [
      {
        id: 9,
        title: 'Creating Your Dream Life',
        description: 'Design a lifestyle that aligns with your values and aspirations.',
        youtubeId: 'TQMbvJNRpLE',
        duration: '22 minutes'
      },
      {
        id: 10,
        title: 'Productive Morning Routine',
        description: 'Transform your mornings with habits that boost productivity and wellness.',
        youtubeId: '9pLk3OU6bOs',
        duration: '18 minutes'
      }
    ]
  };



  // Breathing exercise effect
  useEffect(() => {
    if (breathingActive) {
      const phases = [
        { name: 'inhale', duration: 4000, text: 'Breathe In' },
        { name: 'hold', duration: 2000, text: 'Hold' },
        { name: 'exhale', duration: 6000, text: 'Breathe Out' }
      ];

      let currentPhaseIndex = 0;

      const cycleBreathing = () => {
        const currentPhase = phases[currentPhaseIndex];
        setBreathPhase(currentPhase.name);

        breathingRef.current = setTimeout(() => {
          currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
          if (currentPhaseIndex === 0) {
            setBreathCount(prev => prev + 1);
          }
          if (breathingActive) {
            cycleBreathing();
          }
        }, currentPhase.duration);
      };

      cycleBreathing();
    } else {
      clearTimeout(breathingRef.current);
    }

    return () => clearTimeout(breathingRef.current);
  }, [breathingActive]);

  // Breathing timer effect
  useEffect(() => {
    let breathingTimerRef;

    if (breathingActive && breathingStartTime) {
      breathingTimerRef = setInterval(() => {
        const elapsed = Math.floor((Date.now() - breathingStartTime) / 1000);
        setBreathingDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (breathingTimerRef) {
        clearInterval(breathingTimerRef);
      }
    };
  }, [breathingActive, breathingStartTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(breathingRef.current);
    };
  }, []);



  // Session handlers
  const startMeditationSession = async (meditation) => {
    if (!biosyncUtils.isAuthenticated()) {
      setError('Please log in to start a meditation session');
      return;
    }

    setSelectedMeditation(meditation);
    setSessionStarted(true);

    // Log session start
    try {
      const sessionData = {
        category: selectedCategory,
        sessionName: meditation.title,
        duration: 1, // Default minimal duration for tracking purposes
        type: selectedCategory === 'meditation' ? 'meditation' : selectedCategory
      };

      await logMeditationSession(sessionData);
    } catch (error) {
      console.error('Error logging meditation session:', error);
    }
  };

  const stopSession = () => {
    setSessionStarted(false);
    setSelectedMeditation(null);
  };

  // Helper function for breathing exercise
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  // Breathing exercise handlers
  const startBreathingExercise = () => {
    if (!biosyncUtils.isAuthenticated()) {
      setError('Please log in to start a breathing exercise');
      return;
    }

    setBreathingActive(true);
    setBreathCount(0);
    setBreathPhase('inhale');
    setBreathingDuration(0);
    setBreathingStartTime(Date.now());
  };

  const stopBreathingExercise = async () => {
    if (breathingActive && breathingDuration > 0) {
      // Log breathing session to wellness tracker
      const breathingData = {
        type: 'breathing',
        duration: breathingDuration, // in seconds
        cycles: breathCount,
        completedAt: new Date().toISOString()
      };

      try {
        const response = await logMeditationSession(breathingData);
        if (response?.success) {
          console.log('Breathing exercise logged successfully');
        }
      } catch (error) {
        console.error('Error logging breathing exercise:', error);
        setError('Failed to save breathing exercise');
      }
    }

    setBreathingActive(false);
    setBreathCount(0);
    setBreathPhase('inhale');
    setBreathingDuration(0);
    setBreathingStartTime(null);
  };

  return (
    <div className="meditation-hub">

      {/* Active Session Video */}
      {sessionStarted && selectedMeditation && (
        <div className="active-session">
          <div className="session-header">
            <h3>{selectedMeditation.title}</h3>
            <p>{selectedMeditation.description}</p>
          </div>

          <div className="video-container">
            <div className="youtube-wrapper">
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${selectedMeditation.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedMeditation.title}
                style={{
                  border: 'none',
                  borderRadius: '15px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="session-controls">
            <button className="control-btn back-btn" onClick={stopSession}>
              <span>⬅️</span> Back to Content
            </button>
          </div>
        </div>
      )}

      {/* Main Interface - Hidden during active session */}
      {!sessionStarted && (
        <>
          <div className="meditation-header">
            <h2>Mindful Moments</h2>
            <p>Discover content for fashion, mindfulness, and personal growth</p>
          </div>

          {/* Category Selection */}
          <div className="category-selection">
            <h3>Choose Your Focus</h3>
            <div className="category-grid">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                </button>
              ))}
            </div>
          </div>



          {/* Content List */}
          <div className="meditation-list">
            <h3>Featured Content</h3>
            <div className="meditation-cards">
              {meditations[selectedCategory]?.map((meditation) => (
                <div key={meditation.id} className="meditation-card">
                  <div className="meditation-info">
                    <h4>{meditation.title}</h4>
                    <p>{meditation.description}</p>
                  </div>
                  <button
                    className="play-btn"
                    onClick={() => startMeditationSession(meditation)}
                  >
                    <span className="play-icon">▶️</span>
                    Watch Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Breathing Exercise */}
          <div className="breathing-exercise">
            <h3>{t('biosync.meditation.breathing.title')}</h3>

            {/* Breathing Stats - Show when active */}
            {breathingActive && (
              <div className="breathing-stats">
                <div className="breathing-timer">
                  <span className="timer-label">Duration:</span>
                  <span className="timer-value">{formatTime(breathingDuration)}</span>
                </div>
                <div className="breathing-cycles">
                  <span className="cycles-label">Cycles:</span>
                  <span className="cycles-value">{breathCount}</span>
                </div>
              </div>
            )}

            <div className={`breathing-circle ${breathingActive ? 'active' : ''}`}>
              <div className={`breath-indicator ${breathPhase}`}>
                <span className="breath-text">
                  {breathingActive ? (
                    breathPhase === 'inhale' ? 'Breathe In' :
                    breathPhase === 'hold' ? 'Hold' : 'Breathe Out'
                  ) : 'Breathe'}
                </span>
              </div>
            </div>

            {/* Timer and Controls */}
            <div className="breathing-controls">
              {breathingActive && (
                <div className="breathing-timer-display">
                  <span className="breathing-time">{formatTime(breathingDuration)}</span>
                  <span className="breathing-cycles-count">Cycles: {breathCount}</span>
                </div>
              )}

              {breathingActive ? (
                <button className="breath-btn stop" onClick={stopBreathingExercise}>
                  Stop Exercise
                </button>
              ) : (
                <button className="breath-btn start" onClick={startBreathingExercise}>
                  {t('biosync.meditation.breathing.start')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MeditationHub;
