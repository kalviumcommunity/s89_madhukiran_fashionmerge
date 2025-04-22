const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const session = require('express-session'); // Import express-session
const passport = require('passport'); // Import passport
const app = express();
require('dotenv').config();
require('./passport-config'); // Import passport configuration

// Middleware
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'your-secret-key', // Replace with a secure secret key
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Environment Variables
const PORT = process.env.PORT || 5000;
const STRING = process.env.MONGO_URI;

// Routers
const router = require('./routers/router');
const forgotPassRouter = require('./routers/forgotpass'); // Import forgotpass router

app.use('/route', router); // Register main router
app.use('/route', forgotPassRouter); // Register forgot-password router

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.status(200).send({ msg: 'Google login successful', user: req.user });
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