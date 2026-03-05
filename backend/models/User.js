const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Auth
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    googleId: { type: String },
});

module.exports = mongoose.model('User', userSchema);