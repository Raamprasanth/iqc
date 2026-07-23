const express = require('express');
const router = express.Router();
const Acceptedip = require('../models/Acceptedip');

// GET all accepted IPQC entries
router.get('/', async (req, res) => {
    try {
        const entries = await Acceptedip.find().sort({ date: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch accepted IPQC entries' });
    }
});

// POST a new accepted IPQC entry
router.post('/', async (req, res) => {
    try {
        const { date, model, partNo, partDescription, quantity, totalQuantity, workOrder } = req.body;
        const newEntry = new Acceptedip({ date, model, partNo, partDescription, quantity, totalQuantity, workOrder });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create accepted IPQC entry' });
    }
});

// DELETE an accepted IPQC entry
router.delete('/:id', async (req, res) => {
    try {
        await Acceptedip.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete accepted IPQC entry' });
    }
});

module.exports = router;
