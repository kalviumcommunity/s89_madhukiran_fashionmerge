const express = require('express');
const router = express.Router();
const User = require('../models/schema.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to Verify JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).send({ msg: 'Unauthorized. Token is missing.' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ msg: 'Invalid or expired token.' });
        }
        req.user = user; 
        next();
    });
};

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(409).send({ msg: 'All fields are required' });
        }
        const validUsername = await User.findOne({ username });
        const validEmail = await User.findOne({ email });
        if (validUsername) {
            return res.status(400).send({ msg: 'Username already exists' });
        }
        if (validEmail) {
            return res.status(400).send({ msg: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();
        res.status(201).send({ msg: 'User created successfully', data: savedUser });
    } catch (err) {
        console.error('Error during signup:', err);
        return res.status(500).send({ msg: 'Something went wrong. Please try again later.' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(409).send({ msg: 'Email does not exist' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(409).send({ msg: 'Incorrect password' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ msg: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).send({ msg: 'Something went wrong. Please try again later.' });
    }
});

// Delete User Account (Protected)
router.delete('/delete-account/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from the URL parameter
    const deletedUser = await User.findByIdAndDelete(id); // Find and delete the user by ID

    if (!deletedUser) {
      return res.status(404).send({ msg: 'User not found' });
    }

    res.status(200).send({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send({ msg: 'Something went wrong. Please try again later.' });
  }
});

// Get Authenticated User (Protected)
router.get('/user', authenticateJWT, (req, res) => {
    res.status(200).send({ username: req.user.email });
});

// Get User Profile (Protected)
router.get('/userprofile/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from the URL parameter
    const user = await User.findById(id).select('-password'); // Exclude the password field

    if (!user) {
      return res.status(404).send({ msg: 'User not found' });
    }

    res.status(200).send({ msg: 'User profile fetched successfully', data: user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).send({ msg: 'Something went wrong. Please try again later.' });
  }
});
// Google OAuth Login Route
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback Route
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT Token for Google OAuth
        const token = jwt.sign({ id: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.redirect(`http://localhost:5173/home?token=${token}`); // Pass token to frontend
    }
);

module.exports = router;