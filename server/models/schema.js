const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiration: {
        type: Date,
    },
    cartItems: [{
        id: Number,
        name: String,
        image: String,
        price: Number,
        details: {
            material: String,
            care: String,
            size: [String],
            color: [String]
        },
        stock: Number,
        quantity: Number,
        size: String,
        color: String
    }],
    wishlistItems: [{
        id: Number,
        name: String,
        image: String,
        price: Number,
        details: {
            material: String,
            care: String,
            size: [String],
            color: [String]
        },
        stock: Number
    }],
    chatbotHistory: [{
        message: String,
        timestamp: Date,
        sender: {
            type: String,
            enum: ['user', 'bot'],
            default: 'user'
        }
    }],
    wardrobe: [{
        name: String,
        description: String,
        category: {
            type: String,
            enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'],
            default: 'other'
        },
        color: String,
        season: {
            type: String,
            enum: ['spring', 'summer', 'fall', 'winter', 'all'],
            default: 'all'
        },
        imageUrl: String,
        dateAdded: {
            type: Date,
            default: Date.now
        }
    }],
});
const User = mongoose.model('User', userSchema);
module.exports = User;
