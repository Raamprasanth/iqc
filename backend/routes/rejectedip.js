const express = require('express');
const router = express.Router();
const Rejectedip = require('../models/Rejectedip');

// GET all rejected IPQC entries
router.get('/', async (req, res) => {
    try {
        const entries = await Rejectedip.find().sort({ date: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch rejected IPQC entries' });
    }
});

// POST a new rejected IPQC entry
router.post('/', async (req, res) => {
    try {
        const { date, model, partNo, partDescription, quantity, totalQuantity, workOrder, reason } = req.body;
        const newEntry = new Rejectedip({ date, model, partNo, partDescription, quantity, totalQuantity, workOrder, reason });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create rejected IPQC entry' });
    }
});

// DELETE a rejected IPQC entry
router.delete('/:id', async (req, res) => {
    try {
        await Rejectedip.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete rejected IPQC entry' });
    }
});

module.exports = router;
