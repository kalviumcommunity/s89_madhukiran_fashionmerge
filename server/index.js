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
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:5173/home?token=${token}`);
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

app.listen(PORT, async () => {
    try {
        await mongoose.connect(STRING, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to database');
    } catch (err) {
        console.error('Database connection error:', err);
    }
    console.log(`Server is running on http://localhost:${PORT}`);
});