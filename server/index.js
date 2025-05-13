const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('./models/schema'); // Import User model
const app = express();
require('dotenv').config();
require('./passport-config');

app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Request logger middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;
const STRING = process.env.MONGO_URI;

const router = require('./routers/router');
const forgotPassRouter = require('./routers/forgotpass');
const uploadRoutes = require('./routers/uploadRoutes');
const purchasesRoutes = require('./routes/purchases');
const stripeRoutes = require('./routes/stripe');

app.use(router);
app.use(forgotPassRouter);
app.use('/api/upload', uploadRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/stripe', stripeRoutes);

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT Token for Google OAuth
      // Make sure the id field in the token payload matches what the authenticateJWT middleware expects
      const userId = req.user._id.toString(); // Convert ObjectId to string

      // Log the user ID for debugging
      console.log('Creating JWT token with user ID:', userId);

      // Create token with consistent field names
      const token = jwt.sign({
          id: userId,
          email: req.user.email
      }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Log token payload for debugging (don't log the actual token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('JWT token payload:', decoded);

      console.log('Google auth successful, redirecting with token and userId:', userId);
      console.log('User object:', req.user);

      // Ensure user has all required arrays initialized
      const user = await User.findById(userId);
      if (user) {
        // Initialize arrays if they don't exist
        if (!user.cartItems) user.cartItems = [];
        if (!user.wishlistItems) user.wishlistItems = [];
        if (!user.chatbotHistory) user.chatbotHistory = [];
        if (!user.wardrobe) user.wardrobe = [];
        await user.save();
      }

      // Include both token and userId in the redirect URL
      // The AuthHandler component will process these parameters
      res.redirect(`http://localhost:5173/home?token=${token}&userId=${userId}`);
    } catch (error) {
      console.error('Error in Google auth callback:', error);
      res.redirect(`http://localhost:5173/login?error=auth_error`);
    }
  }
);

// Logout Route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send({ msg: 'Logout failed', error: err });
    }
    res.status(200).send({ msg: 'Logged out successfully' });
  });
});

// Start Server
app.listen(PORT, async () => {
    try {
        await mongoose.connect(STRING, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to database');
    } catch (err) {
        console.error('Database connection error:', err);
    }
    console.log(`Server is running on http://localhost:${PORT}`);
});