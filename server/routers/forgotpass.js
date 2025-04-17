const express = require('express');
const router = express.Router();
const User = require('../models/schema.js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

router.post('/forgot-password', async (req, res) => {
  console.log(req.body); 
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).send({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ msg: 'Email not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; 

    await user.save();

    console.log('Reset token saved:', resetToken); 
    console.log('Token expiration saved:', user.resetTokenExpiration); 

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fashionmergeforyou@gmail.com',
        pass: 'vzar dqxu bmlb azyj' 
      }
    });

    const mailOptions = {
      from: 'fashionmergeforyou@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the link to reset your password: http://localhost:5173/reset-password?token=${resetToken}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({ msg: 'Password reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Something went wrong', error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  console.log('Token received:', token); 
  console.log('Password received:', password); 

  try {
    if (!token || !password) {
      return res.status(400).send({ msg: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    console.log('User found:', user); 

    if (!user) {
      return res.status(400).send({ msg: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).send({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Something went wrong', error: err.message });
  }
});

module.exports = router;