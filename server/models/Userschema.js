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
        required: true,
    },
    resetToken: {
        type: String, 
    },
    resetTokenExpiration: {
        type: Date, 
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;