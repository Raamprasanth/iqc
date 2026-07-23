const express = require('express');
const router = express.Router();
const Iqc = require('../models/Iqc');

// @desc    Get all IQC records
// @route   GET /api/iqc
// @access  Public
router.get('/', async (req, res) => {
    try {
        const records = await Iqc.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Create new IQC record
// @route   POST /api/iqc
// @access  Public
router.post('/', async (req, res) => {
    try {
        const record = await Iqc.create(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get single IQC record
// @route   GET /api/iqc/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const record = await Iqc.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }
        res.status(200).json({ success: true, data: record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update IQC record
// @route   PUT /api/iqc/:id
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const record = await Iqc.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete IQC record
// @route   DELETE /api/iqc/:id
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const record = await Iqc.findByIdAndDelete(req.params.id);
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
