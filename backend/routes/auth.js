const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to create JWT token
const getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey', {
        expiresIn: '30d'
    });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password
        });

        // Create token
        const token = getSignedJwtToken(user._id);

        res.status(201).json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Create token
        const token = getSignedJwtToken(user._id);

        res.status(200).json({ success: true, token, role: user.role, name: user.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
