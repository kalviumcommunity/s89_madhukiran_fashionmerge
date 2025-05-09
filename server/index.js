const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const jwt = require('jsonwebtoken');
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
  (req, res) => {
    // Generate JWT Token for Google OAuth
    // Make sure the id field in the token payload matches what the authenticateJWT middleware expects
    const userId = req.user._id.toString(); // Convert ObjectId to string
    const token = jwt.sign({ id: userId, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Google auth successful, redirecting with token and userId:', userId);
    console.log('User object:', req.user);

    // Include both token and userId in the redirect URL
    res.redirect(`http://localhost:5173/home?token=${token}&userId=${userId}`);
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