const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: function() {
      return this.parent().type === 'visual';
    }
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const pollSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorUsername: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['visual', 'text'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  options: [optionSchema],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['outfits', 'trends', 'accessories', 'colors', 'styles', 'other'],
    default: 'other'
  }
});

// Virtual for total votes
pollSchema.virtual('totalVotes').get(function() {
  return this.options.reduce((total, option) => total + option.votes.length, 0);
});

// Virtual for total comments
pollSchema.virtual('totalComments').get(function() {
  return this.comments.length;
});

// Method to check if a user has voted
pollSchema.methods.hasUserVoted = function(userId) {
  for (const option of this.options) {
    for (const vote of option.votes) {
      if (vote.userId.toString() === userId.toString()) {
        return true;
      }
    }
  }
  return false;
};

// Set toJSON option to include virtuals
pollSchema.set('toJSON', { virtuals: true });
pollSchema.set('toObject', { virtuals: true });

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
