const express = require('express');
const router = express.Router();
const BioSync = require('../models/BioSync');
const auth = require('../middleware/auth');

// Helper function to get or create BioSync profile
const getOrCreateBioSyncProfile = async (userId) => {
  let bioSync = await BioSync.findOne({ userId });

  if (!bioSync) {
    bioSync = new BioSync({
      userId,
      moodEntries: [],
      meditationSessions: [],
      activeChallenges: [],
      completedChallenges: [],
      savedInspiration: [],
      achievements: []
    });
    await bioSync.save();
  }

  return bioSync;
};

// Get user's BioSync profile
router.get('/profile', auth, async (req, res) => {
  try {
    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    // Calculate current streaks
    bioSync.calculateMoodStreak();
    await bioSync.save();

    res.json({
      success: true,
      data: bioSync
    });
  } catch (error) {
    console.error('Error fetching BioSync profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BioSync profile',
      error: error.message
    });
  }
});

// MOOD TRACKING ENDPOINTS

// Add mood entry
router.post('/mood', auth, async (req, res) => {
  try {
    const { mood, notes } = req.body;
    const today = new Date().toDateString();

    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    // Remove any existing entry for today
    bioSync.moodEntries = bioSync.moodEntries.filter(
      entry => new Date(entry.date).toDateString() !== today
    );

    // Add new mood entry
    bioSync.moodEntries.push({
      mood,
      date: new Date(),
      notes: notes || ''
    });

    // Calculate streak and check for achievements
    const streak = bioSync.calculateMoodStreak();

    // Check for streak achievements
    if (streak === 7 && !bioSync.achievements.find(a => a.achievementId === 'week_warrior')) {
      bioSync.addAchievement({
        achievementId: 'week_warrior',
        title: 'Week Warrior',
        description: 'Logged mood for 7 consecutive days',
        icon: '🔥',
        category: 'streak'
      });
    }

    if (bioSync.moodEntries.length === 1 && !bioSync.achievements.find(a => a.achievementId === 'first_mood')) {
      bioSync.addAchievement({
        achievementId: 'first_mood',
        title: 'First Mood Log',
        description: 'Logged your first mood',
        icon: '🎯',
        category: 'mood'
      });
    }

    await bioSync.save();

    res.json({
      success: true,
      message: 'Mood logged successfully',
      data: {
        moodEntry: bioSync.moodEntries[bioSync.moodEntries.length - 1],
        currentStreak: bioSync.currentMoodStreak,
        newAchievements: bioSync.achievements.slice(-2) // Return last 2 achievements
      }
    });
  } catch (error) {
    console.error('Error adding mood entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log mood',
      error: error.message
    });
  }
});

// Get mood history
router.get('/mood/history', auth, async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    // Calculate current streak before returning data
    bioSync.calculateMoodStreak();
    await bioSync.save();

    const moodHistory = bioSync.moodEntries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        moodHistory,
        currentStreak: bioSync.currentMoodStreak,
        longestStreak: bioSync.longestMoodStreak
      }
    });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood history',
      error: error.message
    });
  }
});

// MEDITATION ENDPOINTS

// Add meditation session
router.post('/meditation', auth, async (req, res) => {
  try {
    const { category, duration, sessionName, rating, type, meditation, cycles } = req.body;

    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    // Handle breathing exercises differently
    if (type === 'breathing') {
      const breathingSession = {
        category: 'breathing',
        duration: Math.ceil(duration / 60), // Convert seconds to minutes
        sessionName: 'Breathing Exercise',
        type: 'breathing',
        cycles: cycles || 0,
        completedAt: new Date()
      };

      bioSync.meditationSessions.push(breathingSession);
      bioSync.totalMeditationMinutes += breathingSession.duration;

      // Check for breathing-specific achievements
      if (!bioSync.achievements.find(a => a.achievementId === 'breath_master')) {
        const totalBreathingSessions = bioSync.meditationSessions.filter(s => s.type === 'breathing').length;

        if (totalBreathingSessions === 1) {
          bioSync.addAchievement({
            achievementId: 'breath_beginner',
            title: 'Breath Beginner',
            description: 'Completed your first breathing exercise',
            icon: '🌬️',
            category: 'meditation'
          });
        }

        if (totalBreathingSessions >= 10) {
          bioSync.addAchievement({
            achievementId: 'breath_master',
            title: 'Breath Master',
            description: 'Completed 10 breathing exercises',
            icon: '💨',
            category: 'meditation'
          });
        }
      }

      await bioSync.save();

      res.json({
        success: true,
        message: 'Breathing exercise logged successfully',
        data: {
          session: breathingSession,
          totalMinutes: bioSync.totalMeditationMinutes,
          totalBreathingSessions: bioSync.meditationSessions.filter(s => s.type === 'breathing').length
        }
      });
    } else {
      // Handle regular meditation sessions and new content types
      const session = {
        category: category || 'general',
        duration,
        sessionName: meditation || sessionName || 'Content Session',
        rating: rating || null,
        type: type || 'meditation'
      };

      bioSync.meditationSessions.push(session);
      bioSync.totalMeditationMinutes += duration;

      // Check for meditation achievements
      if (bioSync.meditationSessions.length === 1 && !bioSync.achievements.find(a => a.achievementId === 'mindful_explorer')) {
        bioSync.addAchievement({
          achievementId: 'mindful_explorer',
          title: 'Mindful Explorer',
          description: 'Completed your first meditation session',
          icon: '🧘',
          category: 'meditation'
        });
      }

      if (bioSync.totalMeditationMinutes >= 100 && !bioSync.achievements.find(a => a.achievementId === 'meditation_master')) {
        bioSync.addAchievement({
          achievementId: 'meditation_master',
          title: 'Meditation Master',
          description: 'Completed 100 minutes of meditation',
          icon: '🏆',
          category: 'meditation'
        });
      }

      await bioSync.save();

      res.json({
        success: true,
        message: 'Content session logged successfully',
        data: {
          session,
          totalMinutes: bioSync.totalMeditationMinutes
        }
      });
    }
  } catch (error) {
    console.error('Error adding meditation session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log meditation session',
      error: error.message
    });
  }
});

// WELLNESS CHALLENGES ENDPOINTS

// Join a challenge
router.post('/challenges/join', auth, async (req, res) => {
  try {
    const { challengeId, challengeName, type, duration = 7 } = req.body;

    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    // Check if already joined this challenge
    const existingChallenge = bioSync.activeChallenges.find(
      challenge => challenge.challengeId === challengeId
    );

    if (existingChallenge) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this challenge'
      });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const challenge = {
      challengeId,
      challengeName,
      type,
      endDate,
      dailyEntries: []
    };

    bioSync.activeChallenges.push(challenge);
    await bioSync.save();

    res.json({
      success: true,
      message: 'Successfully joined challenge',
      data: challenge
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join challenge',
      error: error.message
    });
  }
});

// Update challenge progress
router.put('/challenges/:challengeId/progress', auth, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { completed, notes } = req.body;
    const today = new Date().toDateString();

    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    const challenge = bioSync.activeChallenges.find(
      c => c.challengeId === challengeId
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Update or add today's entry
    const existingEntryIndex = challenge.dailyEntries.findIndex(
      entry => new Date(entry.date).toDateString() === today
    );

    const entry = {
      date: new Date(today),
      completed,
      notes: notes || ''
    };

    if (existingEntryIndex >= 0) {
      challenge.dailyEntries[existingEntryIndex] = entry;
    } else {
      challenge.dailyEntries.push(entry);
    }

    // Calculate progress
    const completedDays = challenge.dailyEntries.filter(e => e.completed).length;
    const totalDays = Math.ceil((challenge.endDate - challenge.startDate) / (1000 * 60 * 60 * 24));
    challenge.progress = Math.round((completedDays / totalDays) * 100);

    // Check if challenge is completed
    if (challenge.progress >= 100) {
      challenge.isCompleted = true;
      challenge.completedAt = new Date();

      // Move to completed challenges
      bioSync.completedChallenges.push(challenge);
      bioSync.activeChallenges = bioSync.activeChallenges.filter(
        c => c.challengeId !== challengeId
      );
      bioSync.totalChallengesCompleted += 1;

      // Add achievement
      if (!bioSync.achievements.find(a => a.achievementId === 'challenge_champion')) {
        bioSync.addAchievement({
          achievementId: 'challenge_champion',
          title: 'Challenge Champion',
          description: 'Completed your first wellness challenge',
          icon: '🏆',
          category: 'challenge'
        });
      }
    }

    await bioSync.save();

    res.json({
      success: true,
      message: 'Challenge progress updated',
      data: {
        challenge,
        isCompleted: challenge.isCompleted
      }
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge progress',
      error: error.message
    });
  }
});

// INSPIRATION ENDPOINTS

// Save inspiration item
router.post('/inspiration/save', auth, async (req, res) => {
  try {
    const { type, content, tags } = req.body;

    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    const inspirationItem = {
      type,
      content,
      tags: tags || []
    };

    bioSync.savedInspiration.push(inspirationItem);
    await bioSync.save();

    res.json({
      success: true,
      message: 'Inspiration saved successfully',
      data: inspirationItem
    });
  } catch (error) {
    console.error('Error saving inspiration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save inspiration',
      error: error.message
    });
  }
});

// Get saved inspiration
router.get('/inspiration', auth, async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    let inspiration = bioSync.savedInspiration;

    if (type) {
      inspiration = inspiration.filter(item => item.type === type);
    }

    inspiration = inspiration
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: inspiration
    });
  } catch (error) {
    console.error('Error fetching inspiration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspiration',
      error: error.message
    });
  }
});



// ANALYTICS ENDPOINTS

// Get wellness analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    // Calculate current streaks before returning analytics
    bioSync.calculateMoodStreak();
    await bioSync.save();

    // Calculate mood distribution
    const moodDistribution = {};
    bioSync.moodEntries.forEach(entry => {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    });

    // Get recent trends (last 7 days)
    const recentMoods = bioSync.moodEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const analytics = {
      overview: {
        totalMoodLogs: bioSync.moodEntries.length,
        currentMoodStreak: bioSync.currentMoodStreak,
        longestMoodStreak: bioSync.longestMoodStreak,
        totalMeditationMinutes: bioSync.totalMeditationMinutes,
        totalChallengesCompleted: bioSync.totalChallengesCompleted,
        totalAchievements: bioSync.achievements.length,
        wellnessScore: bioSync.wellnessScore
      },
      moodDistribution,
      recentMoods,
      achievements: bioSync.achievements.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt)),
      activeChallenges: bioSync.activeChallenges,
      meditationStats: {
        totalSessions: bioSync.meditationSessions.length,
        totalMinutes: bioSync.totalMeditationMinutes,
        averageSessionLength: bioSync.meditationSessions.length > 0
          ? Math.round(bioSync.totalMeditationMinutes / bioSync.meditationSessions.length)
          : 0,
        breathingSessions: bioSync.meditationSessions.filter(s => s.type === 'breathing').length,
        totalBreathingCycles: bioSync.meditationSessions
          .filter(s => s.type === 'breathing')
          .reduce((total, session) => total + (session.cycles || 0), 0),
        meditationSessions: bioSync.meditationSessions.filter(s => s.type === 'meditation' || !s.type).length
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// PREFERENCES ENDPOINTS

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { reminderTime, enableNotifications, preferredMeditationDuration, favoriteCategories } = req.body;

    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    // Update preferences
    if (reminderTime !== undefined) bioSync.preferences.reminderTime = reminderTime;
    if (enableNotifications !== undefined) bioSync.preferences.enableNotifications = enableNotifications;
    if (preferredMeditationDuration !== undefined) bioSync.preferences.preferredMeditationDuration = preferredMeditationDuration;
    if (favoriteCategories !== undefined) bioSync.preferences.favoriteCategories = favoriteCategories;

    await bioSync.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: bioSync.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    res.json({
      success: true,
      data: bioSync.preferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences',
      error: error.message
    });
  }
});

// DELETE ENDPOINTS

// Remove inspiration item
router.delete('/inspiration/:inspirationId', auth, async (req, res) => {
  try {
    const { inspirationId } = req.params;

    const bioSync = await getOrCreateBioSyncProfile(req.user.id);

    bioSync.savedInspiration = bioSync.savedInspiration.filter(
      item => item._id.toString() !== inspirationId
    );

    await bioSync.save();

    res.json({
      success: true,
      message: 'Inspiration item removed successfully'
    });
  } catch (error) {
    console.error('Error removing inspiration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove inspiration',
      error: error.message
    });
  }
});

module.exports = router;
