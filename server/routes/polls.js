const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const User = require('../models/schema');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Get notifications for a user (protected route)
router.get('/notifications', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read (protected route)
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Get all active polls with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent', category, type } = req.query;

    // Build query
    const query = { isActive: true };

    // Add filters if provided
    if (category && category !== 'all') {
      query.category = category;
    }

    if (type && (type === 'visual' || type === 'text')) {
      query.type = type;
    }

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'popular':
        // This is a bit tricky since totalVotes is a virtual
        // We'll handle this in memory after fetching
        sortOption = { createdAt: -1 }; // Default to recent first
        break;
      case 'recent':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Execute query with pagination
    const polls = await Poll.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('creator', 'username profileImage');

    // Get total count for pagination
    const totalPolls = await Poll.countDocuments(query);

    // If sorting by popular, we need to sort in memory
    if (sort === 'popular') {
      polls.sort((a, b) => b.totalVotes - a.totalVotes);
    }

    res.status(200).json({
      success: true,
      data: {
        polls,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPolls / parseInt(limit)),
        totalPolls
      }
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch polls',
      error: error.message
    });
  }
});

// Get a single poll by ID
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('creator', 'username profileImage')
      .populate('comments.userId', 'username profileImage');

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch poll',
      error: error.message
    });
  }
});

// Create a new poll (protected route)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, type, options, category, expiresAt } = req.body;
    const userId = req.user.id;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Parse options
    let parsedOptions = [];
    if (type === 'text') {
      // For text polls, options should be an array of strings
      parsedOptions = JSON.parse(options).map(option => ({
        content: option,
        votes: []
      }));
    } else if (type === 'visual') {
      // For visual polls, we need to upload images to Cloudinary
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Images are required for visual polls'
        });
      }

      // Parse option texts
      const optionTexts = JSON.parse(options);

      // Upload images to Cloudinary
      const uploadPromises = req.files.map(async (file, index) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'fashion_merge/polls',
          resource_type: 'image'
        });

        return {
          content: optionTexts[index] || `Option ${index + 1}`,
          imageUrl: result.secure_url,
          votes: []
        };
      });

      parsedOptions = await Promise.all(uploadPromises);
    }

    // Create new poll
    const newPoll = new Poll({
      creator: userId,
      creatorUsername: user.username,
      type,
      title,
      description,
      options: parsedOptions,
      category: category || 'other',
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await newPoll.save();

    // Emit socket event for new poll (will be implemented in index.js)
    if (req.app.get('io')) {
      req.app.get('io').emit('new_poll', {
        pollId: newPoll._id,
        creatorId: userId,
        creatorUsername: user.username,
        title: newPoll.title
      });
    }

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: newPoll
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create poll',
      error: error.message
    });
  }
});

// Vote on a poll (protected route)
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const pollId = req.params.id;
    const userId = req.user.id;

    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This poll is no longer active'
      });
    }

    // Check if option exists
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option index'
      });
    }

    // Check if user has already voted
    if (poll.hasUserVoted(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // Add vote
    poll.options[optionIndex].votes.push({
      userId,
      timestamp: new Date()
    });

    await poll.save();

    // Get user info for notification
    const user = await User.findById(userId);

    // Create notification for poll creator (if not voting on own poll)
    if (poll.creator.toString() !== userId.toString()) {
      const notification = new Notification({
        recipient: poll.creator,
        sender: userId,
        senderUsername: user.username,
        type: 'poll_vote',
        content: `${user.username} voted on your poll`,
        pollId: poll._id,
        pollTitle: poll.title
      });

      await notification.save();

      // Emit socket event for notification
      if (req.app.get('io')) {
        req.app.get('io').to(poll.creator.toString()).emit('notification', {
          type: 'poll_vote',
          pollId: poll._id,
          pollTitle: poll.title,
          senderUsername: user.username
        });
      }
    }

    // Emit socket event for poll update
    if (req.app.get('io')) {
      req.app.get('io').emit('poll_update', {
        pollId: poll._id,
        totalVotes: poll.totalVotes,
        options: poll.options.map(option => ({
          _id: option._id,
          content: option.content,
          voteCount: option.votes.length
        }))
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
});

// Add a comment to a poll (protected route)
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const pollId = req.params.id;
    const userId = req.user.id;

    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This poll is no longer active'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add comment
    const newComment = {
      userId,
      username: user.username,
      content,
      timestamp: new Date()
    };

    poll.comments.push(newComment);
    await poll.save();

    // Create notification for poll creator (if not commenting on own poll)
    if (poll.creator.toString() !== userId.toString()) {
      const notification = new Notification({
        recipient: poll.creator,
        sender: userId,
        senderUsername: user.username,
        type: 'poll_comment',
        content: `${user.username} commented on your poll`,
        pollId: poll._id,
        pollTitle: poll.title
      });

      await notification.save();

      // Emit socket event for notification
      if (req.app.get('io')) {
        req.app.get('io').to(poll.creator.toString()).emit('notification', {
          type: 'poll_comment',
          pollId: poll._id,
          pollTitle: poll.title,
          senderUsername: user.username,
          comment: content
        });
      }
    }

    // Emit socket event for comment update
    if (req.app.get('io')) {
      req.app.get('io').emit('poll_comment', {
        pollId: poll._id,
        comment: {
          ...newComment,
          userId: {
            _id: user._id,
            username: user.username,
            profileImage: user.profileImage
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        ...newComment,
        userId: {
          _id: user._id,
          username: user.username,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// Delete a poll (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user.id;

    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if the user is the creator of the poll
    if (poll.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the creator can delete this poll'
      });
    }

    // Delete the poll
    await Poll.findByIdAndDelete(pollId);

    // Emit socket event for poll deletion
    if (req.app.get('io')) {
      req.app.get('io').emit('poll_deleted', {
        pollId: pollId
      });
    }

    res.status(200).json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete poll',
      error: error.message
    });
  }
});

module.exports = router;
