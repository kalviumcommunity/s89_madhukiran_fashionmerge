const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to Verify JWT
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized. Token is missing.'
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.',
            error: error.message
        });
    }
};

module.exports = auth;
