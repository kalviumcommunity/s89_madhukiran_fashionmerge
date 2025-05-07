const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripeConfig = require('../config/stripe');
const Purchase = require('../models/Purchase');
const User = require('../models/schema');

// Create a payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, metadata } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    
    // Create a payment intent using our dummy Stripe config
    const paymentIntent = await stripeConfig.createPaymentIntent(
      amount,
      'usd',
      { userId: req.user.id, ...metadata }
    );
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// Process payment and save order
router.post('/process-payment', auth, async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      products, 
      totalAmount, 
      shippingAddress 
    } = req.body;
    
    const userId = req.user.id;
    
    if (!paymentIntentId || !products || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Confirm payment (dummy implementation)
    const paymentConfirmation = await stripeConfig.confirmPayment(paymentIntentId);
    
    if (paymentConfirmation.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        status: paymentConfirmation.status
      });
    }
    
    // Create a new purchase record
    const purchase = new Purchase({
      userId,
      products,
      totalAmount,
      shippingAddress,
      paymentInfo: {
        paymentId: paymentIntentId,
        paymentMethod: 'Stripe',
        paymentStatus: 'completed'
      }
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
      message: 'Payment processed and order created successfully',
      data: {
        orderId: purchase._id,
        paymentId: paymentIntentId,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

module.exports = router;
