const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'your_super_secret_jwt_key_khalsa_punjab';

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name, email, password: hashedPassword, phone, role: 'customer'
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('Login error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.toJSON());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update current user profile picture
router.put('/me/profile-pic', authMiddleware, async (req, res) => {
    try {
        const { profilePic } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { profilePic }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.toJSON());
    } catch (err) {
        console.error('Profile pic error', err);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
});

module.exports = { router, authMiddleware, JWT_SECRET };
