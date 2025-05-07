const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const User = require('../models/schema');
const auth = require('../middleware/auth');

// Create a new purchase
router.post('/', auth, async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, paymentInfo } = req.body;
    const userId = req.user.id;

    // Create a new purchase record
    const purchase = new Purchase({
      userId,
      products,
      totalAmount,
      shippingAddress,
      paymentInfo
    });

    // Save the purchase to the database
    await purchase.save();

    // Clear the user's cart after successful purchase
    await User.findByIdAndUpdate(
      userId,
      { $set: { cartItems: [] } }
    );

    res.status(201).json({
      success: true,
      message: 'Purchase completed successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete purchase',
      error: error.message
    });
  }
});

// Get all purchases for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure the user can only access their own purchases
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to purchases'
      });
    }

    const purchases = await Purchase.find({ userId }).sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: error.message
    });
  }
});

// Get a specific purchase by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Ensure the user can only access their own purchase
    if (purchase.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to purchase'
      });
    }

    res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase',
      error: error.message
    });
  }
});

module.exports = router;
