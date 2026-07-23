const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
    try {
        // Map username from frontend to email in backend
        if (req.body.username && !req.body.email) {
            req.body.email = req.body.username;
        }
        
        // Automatically set role based on dept
        if (req.body.dept) {
            req.body.role = req.body.dept.toLowerCase() === 'admin' ? 'admin' : 'user';
        }

        const user = await User.create(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (req.body.username) {
            req.body.email = req.body.username;
        }
        
        if (req.body.dept) {
            req.body.role = req.body.dept.toLowerCase() === 'admin' ? 'admin' : 'user';
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.dept = req.body.dept || user.dept;
        user.active = req.body.active !== undefined ? req.body.active : user.active;
        user.role = req.body.role || user.role;

        if (req.body.password) {
            user.password = req.body.password;
        }

        await user.save(); // pre-save hook handles hashing

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
