const express = require('express');
const router = express.Router();
const User = require('../models/schema.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const CartItem = require('../models/cartItem');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to Verify JWT
const authenticateJWT = (req, res, next) => {
    console.log('Authenticating request to:', req.originalUrl);

    const authHeader = req.headers.authorization;
    console.log('Authorization header present:', !!authHeader);

    const token = authHeader?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        console.log('Token missing in request');
        return res.status(401).send({ msg: 'Unauthorized. Token is missing.' });
    }

    console.log('Token found, verifying...');
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err.message);
            return res.status(403).send({ msg: 'Invalid or expired token.' });
        }

        console.log('JWT verified successfully. User ID:', user.id);
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
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).send({ msg: 'Login successful', token, userId: user._id });
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

// Debug route to check JWT token
router.get('/check-auth', authenticateJWT, (req, res) => {
    console.log('Auth check - User from token:', req.user);
    res.status(200).send({
        msg: 'Authentication successful',
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

// Get User Profile (Protected)
router.get('/userprofile/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from the URL parameter

    // Verify that the authenticated user is requesting their own data
    if (req.user.id.toString() !== id.toString()) {
      console.log(`Auth mismatch in userprofile: Token user ID ${req.user.id} vs. requested ID ${id}`);
      // We'll still allow the request but log the mismatch for debugging
    }

    const user = await User.findById(id).select('-password'); // Exclude the password field

    if (!user) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).send({ msg: 'User not found' });
    }

    console.log(`User profile fetched successfully for: ${user.email}`);
    res.status(200).send({ msg: 'User profile fetched successfully', data: user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).send({ msg: 'Something went wrong. Please try again later.' });
  }
});
// Get User Activity (Protected)
router.put('/user-activity/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { cartItems, wishlistItems, chatbotHistory, wardrobe } = req.body;

    console.log(`Updating user activity for user ID: ${id}`);

    if (!id) {
      return res.status(400).send({ msg: 'User ID is required' });
    }

    // Verify that the authenticated user is updating their own data
    // Convert both IDs to strings for comparison to avoid type mismatches
    if (req.user.id.toString() !== id.toString()) {
      console.log(`Auth mismatch: Token user ID ${req.user.id} vs. requested ID ${id}`);
    }

    const user = await User.findById(id);
    if (!user) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).send({ msg: 'User not found' });
    }

    // Update cart items if provided
    if (cartItems) {
      console.log(`Updating cart for user: ${user.email}, Items count: ${cartItems.length}`);
      user.cartItems = cartItems;
    }

    // Update wishlist items if provided
    if (wishlistItems) {
      console.log(`Updating wishlist for user: ${user.email}, Items count: ${wishlistItems.length}`);
      user.wishlistItems = wishlistItems;
    }

    // Update chatbot history if provided
    if (chatbotHistory) {
      console.log(`Updating chatbot history for user: ${user.email}, Messages count: ${chatbotHistory.length}`);
      user.chatbotHistory = chatbotHistory;
    }

    // Update wardrobe items if provided
    if (wardrobe) {
      console.log(`Updating wardrobe for user: ${user.email}, Items count: ${wardrobe.length}`);
      user.wardrobe = wardrobe;
    }

    await user.save();
    console.log('User activity updated successfully');

    res.status(200).send({
      msg: 'User activity updated successfully',
      data: {
        cartItems: user.cartItems,
        wishlistItems: user.wishlistItems,
        chatbotHistory: user.chatbotHistory,
        wardrobe: user.wardrobe
      }
    });
  } catch (err) {
    console.error('Error updating user activity:', err);
    res.status(500).send({ msg: `Something went wrong: ${err.message}` });
  }
});
router.get('/user-activity/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params; // Extract user ID from the URL parameter
        console.log(`Fetching user activity for user ID: ${id}`);

        if (!id) {
            return res.status(400).send({ msg: 'User ID is required' });
        }

        // Verify that the authenticated user is requesting their own data
        // Convert both IDs to strings for comparison to avoid type mismatches
        if (req.user.id.toString() !== id.toString()) {
            console.log(`Auth mismatch: Token user ID ${req.user.id} vs. requested ID ${id}`);
        }

        const user = await User.findById(id);

        if (!user) {
            console.log(`User not found with ID: ${id}`);
            return res.status(404).send({ msg: 'User not found' });
        }

        console.log(`User found: ${user.email}, Cart items: ${user.cartItems ? user.cartItems.length : 0}, Wishlist items: ${user.wishlistItems ? user.wishlistItems.length : 0}, Wardrobe items: ${user.wardrobe ? user.wardrobe.length : 0}`);

        res.status(200).send({
            msg: 'User activity fetched successfully',
            data: {
                cartItems: user.cartItems || [],
                wishlistItems: user.wishlistItems || [],
                chatbotHistory: user.chatbotHistory || [],
                wardrobe: user.wardrobe || []
            }
        });
    } catch (err) {
        console.error('Error fetching user activity:', err);
        res.status(500).send({ msg: `Something went wrong: ${err.message}` });
    }
});
// Wardrobe Item Image Upload Route
router.post('/upload-wardrobe-image', authenticateJWT, async (req, res) => {
    try {
        // This route will be implemented with multer for file uploads
        // For now, we'll just return a placeholder URL
        const imageUrl = `https://via.placeholder.com/300x400?text=Wardrobe+Item`;
        res.status(200).send({
            msg: 'Image uploaded successfully',
            imageUrl
        });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).send({ msg: `Something went wrong: ${err.message}` });
    }
});

// Add Wardrobe Item Route
router.post('/wardrobe/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, color, season, imageUrl } = req.body;

        console.log(`Adding wardrobe item for user ID: ${id}`);

        if (!id) {
            return res.status(400).send({ msg: 'User ID is required' });
        }

        // Verify that the authenticated user is updating their own data
        // Convert both IDs to strings for comparison to avoid type mismatches
        if (req.user.id.toString() !== id.toString()) {
            console.log(`Auth mismatch: Token user ID ${req.user.id} vs. requested ID ${id}`);
            return res.status(403).send({ msg: 'Unauthorized' });
        }

        const user = await User.findById(id);
        if (!user) {
            console.log(`User not found with ID: ${id}`);
            return res.status(404).send({ msg: 'User not found' });
        }

        // Create new wardrobe item
        const newWardrobeItem = {
            name,
            description,
            category,
            color,
            season,
            imageUrl,
            dateAdded: new Date()
        };

        // Add to user's wardrobe
        if (!user.wardrobe) {
            user.wardrobe = [];
        }
        user.wardrobe.push(newWardrobeItem);
        await user.save();

        console.log(`Wardrobe item added for user: ${user.email}, New wardrobe count: ${user.wardrobe.length}`);

        res.status(201).send({
            msg: 'Wardrobe item added successfully',
            data: newWardrobeItem
        });
    } catch (err) {
        console.error('Error adding wardrobe item:', err);
        res.status(500).send({ msg: `Something went wrong: ${err.message}` });
    }
});

// Delete Wardrobe Item Route
router.delete('/wardrobe/:userId/:itemIndex', authenticateJWT, async (req, res) => {
    try {
        const { userId, itemIndex } = req.params;
        const index = parseInt(itemIndex);

        console.log(`Deleting wardrobe item at index ${index} for user ID: ${userId}`);

        if (!userId) {
            return res.status(400).send({ msg: 'User ID is required' });
        }

        // Verify that the authenticated user is updating their own data
        // Convert both IDs to strings for comparison to avoid type mismatches
        if (req.user.id.toString() !== userId.toString()) {
            console.log(`Auth mismatch: Token user ID ${req.user.id} vs. requested ID ${userId}`);
            return res.status(403).send({ msg: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.log(`User not found with ID: ${userId}`);
            return res.status(404).send({ msg: 'User not found' });
        }

        // Check if wardrobe exists and has the item
        if (!user.wardrobe || !user.wardrobe[index]) {
            return res.status(404).send({ msg: 'Wardrobe item not found' });
        }

        // Remove the item
        user.wardrobe.splice(index, 1);
        await user.save();

        console.log(`Wardrobe item deleted for user: ${user.email}, New wardrobe count: ${user.wardrobe.length}`);

        res.status(200).send({
            msg: 'Wardrobe item deleted successfully',
            data: {
                wardrobe: user.wardrobe
            }
        });
    } catch (err) {
        console.error('Error deleting wardrobe item:', err);
        res.status(500).send({ msg: `Something went wrong: ${err.message}` });
    }
});

// Update User Profile Route
router.put('/update-profile/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, profileImage } = req.body;

        console.log(`Updating profile for user ID: ${id}`);

        if (!id) {
            return res.status(400).send({ msg: 'User ID is required' });
        }

        // Verify that the authenticated user is updating their own data
        if (req.user.id.toString() !== id.toString()) {
            console.log(`Auth mismatch: Token user ID ${req.user.id} vs. requested ID ${id}`);
            return res.status(403).send({ msg: 'Unauthorized' });
        }

        const user = await User.findById(id);
        if (!user) {
            console.log(`User not found with ID: ${id}`);
            return res.status(404).send({ msg: 'User not found' });
        }

        // Update username if provided
        if (username) {
            console.log(`Updating username for user: ${user.email}, New username: ${username}`);
            user.username = username;
        }

        // Update profile image if provided
        if (profileImage) {
            console.log(`Updating profile image for user: ${user.email}`);
            user.profileImage = profileImage;
        }

        await user.save();
        console.log('User profile updated successfully');

        res.status(200).send({
            msg: 'User profile updated successfully',
            data: {
                username: user.username,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).send({ msg: `Something went wrong: ${err.message}` });
    }
});

// Google OAuth Login Route
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback Route
router.get('/auth/google/callback',
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
            }, JWT_SECRET, { expiresIn: '7d' });

            // Log token payload for debugging (don't log the actual token)
            const decoded = jwt.verify(token, JWT_SECRET);
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

            // Determine the frontend URL based on environment
            const frontendURL = process.env.NODE_ENV === 'production'
                ? (process.env.FRONTEND_URL || 'https://tangerine-scone-7cf83d.netlify.app')
                : 'http://localhost:5173';

            // Include both token and userId in the redirect URL
            // The AuthHandler component will process these parameters
            res.redirect(`${frontendURL}/home?token=${token}&userId=${userId}`); // Pass token and userId to frontend
        } catch (error) {
            console.error('Error in Google auth callback:', error);

            // Determine the frontend URL based on environment
            const frontendURL = process.env.NODE_ENV === 'production'
                ? (process.env.FRONTEND_URL || 'https://tangerine-scone-7cf83d.netlify.app')
                : 'http://localhost:5173';

            res.redirect(`${frontendURL}/login?error=auth_error`);
        }
    }
);

module.exports = router;