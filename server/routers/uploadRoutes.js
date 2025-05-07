const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../utils/upload');
const jwt = require('jsonwebtoken');

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

// Upload image to Cloudinary
router.post('/upload', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received');

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).send({ msg: 'No file uploaded' });
    }

    console.log('File received:', {
      mimetype: req.file.mimetype,
      size: req.file.size,
      originalname: req.file.originalname
    });

    // Check if Cloudinary credentials are set
    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    console.log('Cloudinary properly configured:', cloudinaryConfigured);

    let imageUrl;
    let publicId;

    if (cloudinaryConfigured) {
      // Convert buffer to base64 string
      const fileStr = req.file.buffer.toString('base64');
      const fileType = req.file.mimetype;

      // Create data URI
      const dataURI = `data:${fileType};base64,${fileStr}`;

      console.log('Attempting to upload to Cloudinary...');

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'wardrobe', // Store in a folder called 'wardrobe'
        resource_type: 'image',
        transformation: [
          { width: 800, crop: 'limit' }, // Resize to max width of 800px
        ]
      });

      console.log('Cloudinary upload successful:', {
        secure_url: result.secure_url,
        public_id: result.public_id
      });

      imageUrl = result.secure_url;
      publicId = result.public_id;
    } else {
      // Fallback for testing when Cloudinary is not configured
      console.log('Using fallback for image URL (Cloudinary not configured)');

      // Generate a placeholder URL
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(2, 15);
      imageUrl = `https://via.placeholder.com/800x600?text=Wardrobe+Item+${timestamp}+${randomId}`;
      publicId = `placeholder_${timestamp}_${randomId}`;
    }

    // Return the image URL
    res.status(200).send({
      msg: 'Image uploaded successfully',
      imageUrl: imageUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    // Log more detailed error information
    if (error.http_code) {
      console.error('Cloudinary HTTP error code:', error.http_code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }

    res.status(500).send({
      msg: 'Error uploading image',
      error: error.message
    });
  }
});

// Delete image from Cloudinary
router.delete('/delete/:publicId', authenticateJWT, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).send({ msg: 'Image deleted successfully' });
    } else {
      res.status(400).send({ msg: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    res.status(500).send({
      msg: 'Error deleting image',
      error: error.message
    });
  }
});

module.exports = router;
