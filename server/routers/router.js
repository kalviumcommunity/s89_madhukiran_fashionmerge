const express = require('express');
const router = express.Router();
const User = require('../models/schema.js');
const bcrypt = require('bcrypt');
const passport = require('passport');

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
    res.status(200).send({ msg: 'User created successfully', data: savedUser });
  } catch (err) {
    console.error('Error during signup:', err);
    return res.status(500).send({ msg: 'Something went wrong. Please try again later.' });
  }
});


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
    req.login(user, (err) => {
      if (err) {
        console.error('Error during login:', err);
        return res.status(500).send({ msg: 'Login failed. Please try again later.' });
      }
      res.status(200).send({ msg: 'Login successful' });
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).send({ msg: 'Something went wrong. Please try again later.' });
  }
});


router.get('/user', (req, res) => {
  console.log('Authenticated user:', req.user);
  if (req.isAuthenticated()) {
    res.status(200).send({ username: req.user.username });
  } else {
    res.status(401).send({ msg: 'Unauthorized. Please log in.' });
  }
});


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173/home');
  }
);


router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send({ msg: 'Logout failed. Please try again later.' });
    }
    res.status(200).send({ msg: 'Logged out successfully' });
  });
});

module.exports = router;