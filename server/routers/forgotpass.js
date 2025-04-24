const express = require('express');
const router = express.Router();
const User = require('../models/schema.js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

router.post('/forgot-password', async (req, res) => {
  console.log(req.body); // Debugging: Log the request body
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).send({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ msg: 'Email not found' });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour

    // Save the token and expiration in the database
    await user.save();

    console.log('Reset token saved:', resetToken); // Debugging
    console.log('Token expiration saved:', user.resetTokenExpiration); // Debugging

// ... existing code ...

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fashionmergeforyou@gmail.com',
    pass: 'vzar dqxu bmlb azyj'
  },
  tls: {
    rejectUnauthorized: false
  }
});

const mailOptions = {
  from: {
    name: 'FashionMerge Support',
    address: 'fashionmergeforyou@gmail.com'
  },
  to: email,
  subject: 'Password Reset Request - FashionMerge',
  priority: 'high',
  headers: {
    'List-Unsubscribe': '<mailto:fashionmergeforyou@gmail.com>'
  },
  text: `Hello,\n\nWe received a password reset request for your FashionMerge account.\n\nClick the link below to reset your password:\nhttp://localhost:5173/reset-password?token=${resetToken}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nFashionMerge Team`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <p>Hello,</p>
        <p>We received a password reset request for your FashionMerge account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173/reset-password?token=${resetToken}"
             style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666;">This link will expire in 1 hour.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>This is an automated message from FashionMerge. Please do not reply to this email.</p>
        <p>© 2024 FashionMerge. All rights reserved.</p>
      </div>
    </div>
  `
};

await transporter.sendMail(mailOptions);

// ... rest of the code ...

    res.status(200).send({ msg: 'Password reset link sent to your email, please check your spam folder incase if you didnt receive the mail' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: 'Something went wrong', error: err.message });
  }
});

router.put('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  console.log('Token received:', token); // Debugging
  console.log('Password received:', password); // Debugging

  try {
    if (!token || !password) {
      return res.status(400).send({ msg: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() } // Ensure token is not expired
    });

    console.log('User found:', user); // Debugging

    if (!user) {
      return res.status(400).send({ msg: 'Invalid or expired token' });
    }

    // Hash the new password
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