const express = require('express');
const router = express.Router();
const Production = require('../models/Production');

// @desc    Get all Production records
// @route   GET /api/production
// @access  Public
router.get('/', async (req, res) => {
    try {
        const records = await Production.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Create new Production record
// @route   POST /api/production
// @access  Public
router.post('/', async (req, res) => {
    try {
        const record = await Production.create(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get single Production record
// @route   GET /api/production/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const record = await Production.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }
        res.status(200).json({ success: true, data: record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update Production record
// @route   PUT /api/production/:id
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const record = await Production.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }
        res.status(200).json({ success: true, data: record });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Delete Production record
// @route   DELETE /api/production/:id
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const record = await Production.findByIdAndDelete(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
