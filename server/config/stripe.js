// This is a dummy Stripe configuration for demonstration purposes
// In a real application, you would use your actual Stripe API keys

const stripeConfig = {
  // For demonstration purposes, we're using a dummy key
  // In production, you would use your actual Stripe secret key from environment variables
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key',
  
  // Dummy function to create a payment intent
  createPaymentIntent: async (amount, currency = 'usd', metadata = {}) => {
    // In a real implementation, this would call the Stripe API
    // For our dummy implementation, we'll just return a mock response
    
    const paymentIntentId = 'pi_' + Math.random().toString(36).substring(2, 15);
    
    return {
      id: paymentIntentId,
      amount: amount,
      currency: currency,
      status: 'succeeded',
      client_secret: 'dummy_client_secret_' + paymentIntentId,
      metadata: metadata
    };
  },
  
  // Dummy function to confirm a payment
  confirmPayment: async (paymentIntentId) => {
    // In a real implementation, this would call the Stripe API
    // For our dummy implementation, we'll just return a mock response
    
    return {
      id: paymentIntentId,
      status: 'succeeded',
      next_action: null
    };
  }
};

module.exports = stripeConfig;
