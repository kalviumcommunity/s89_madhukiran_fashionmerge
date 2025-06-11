const mongoose = require('mongoose');

// Mood Entry Schema
const moodEntrySchema = new mongoose.Schema({
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'low', 'stressed'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
});

// Meditation Session Schema
const meditationSessionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['morning', 'evening', 'stress', 'focus', 'sleep', 'breathing', 'general', 'fashion', 'meditation', 'personality', 'confidence', 'lifestyle'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  sessionName: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  type: {
    type: String,
    enum: ['meditation', 'breathing', 'fashion', 'personality', 'lifestyle', 'confidence'],
    default: 'meditation'
  },
  cycles: {
    type: Number, // For breathing exercises
    default: 0
  }
});

// Wellness Challenge Schema
const wellnessChallengeSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true
  },
  challengeName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['gratitude', 'mindfulness', 'creativity', 'movement'],
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dailyEntries: [{
    date: Date,
    completed: Boolean,
    notes: String
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

// Community Circle Schema
const communityCircleSchema = new mongoose.Schema({
  circleId: {
    type: String,
    required: true
  },
  circleName: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contributions: [{
    date: Date,
    type: {
      type: String,
      enum: ['post', 'comment', 'support']
    },
    content: String
  }]
});

// Inspiration Item Schema
const inspirationItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quote', 'story', 'art', 'prompt'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  isFavorite: {
    type: Boolean,
    default: true
  },
  tags: [String]
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
  achievementId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['mood', 'meditation', 'challenge', 'community', 'streak'],
    required: true
  }
});

// Main BioSync Schema
const bioSyncSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Mood Tracking
  moodEntries: [moodEntrySchema],
  currentMoodStreak: {
    type: Number,
    default: 0
  },
  longestMoodStreak: {
    type: Number,
    default: 0
  },

  // Meditation
  meditationSessions: [meditationSessionSchema],
  totalMeditationMinutes: {
    type: Number,
    default: 0
  },
  meditationStreak: {
    type: Number,
    default: 0
  },

  // Wellness Challenges
  activeChallenges: [wellnessChallengeSchema],
  completedChallenges: [wellnessChallengeSchema],
  totalChallengesCompleted: {
    type: Number,
    default: 0
  },

  // Community
  joinedCircles: [communityCircleSchema],
  communityPoints: {
    type: Number,
    default: 0
  },

  // Inspiration
  savedInspiration: [inspirationItemSchema],

  // Achievements
  achievements: [achievementSchema],
  totalPoints: {
    type: Number,
    default: 0
  },

  // Analytics
  weeklyGoals: {
    moodCheckins: { type: Number, default: 7 },
    meditationMinutes: { type: Number, default: 70 },
    challengeProgress: { type: Number, default: 50 }
  },

  // Settings
  preferences: {
    reminderTime: String,
    enableNotifications: { type: Boolean, default: true },
    preferredMeditationDuration: { type: Number, default: 10 },
    favoriteCategories: [String]
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bioSyncSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total wellness score
bioSyncSchema.virtual('wellnessScore').get(function() {
  const moodScore = this.currentMoodStreak * 10;
  const meditationScore = this.totalMeditationMinutes;
  const challengeScore = this.totalChallengesCompleted * 50;
  const communityScore = this.communityPoints;

  return moodScore + meditationScore + challengeScore + communityScore;
});

// Method to calculate current mood streak
bioSyncSchema.methods.calculateMoodStreak = function() {
  if (this.moodEntries.length === 0) return 0;

  const sortedEntries = this.moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (entryDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  this.currentMoodStreak = streak;
  if (streak > this.longestMoodStreak) {
    this.longestMoodStreak = streak;
  }

  return streak;
};

// Method to add achievement
bioSyncSchema.methods.addAchievement = function(achievementData) {
  const existingAchievement = this.achievements.find(
    achievement => achievement.achievementId === achievementData.achievementId
  );

  if (!existingAchievement) {
    this.achievements.push(achievementData);
    this.totalPoints += 100; // Each achievement gives 100 points
    return true;
  }
  return false;
};

// Set toJSON option to include virtuals
bioSyncSchema.set('toJSON', { virtuals: true });
bioSyncSchema.set('toObject', { virtuals: true });

const BioSync = mongoose.model('BioSync', bioSyncSchema);

module.exports = BioSync;
