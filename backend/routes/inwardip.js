const express = require('express');
const router = express.Router();
const Inwardip = require('../models/Inwardip');

// GET all inward IPQC entries
router.get('/', async (req, res) => {
    try {
        const entries = await Inwardip.find().sort({ date: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inward IPQC entries' });
    }
});

// POST a new inward IPQC entry (supports single entry or bulk array)
router.post('/', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const savedEntries = await Inwardip.insertMany(req.body);
            return res.status(201).json(savedEntries);
        }
        const { date, model, partNo, partDescription, quantity, workOrder } = req.body;
        const newEntry = new Inwardip({ date, model, partNo, partDescription, quantity, workOrder });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create inward IPQC entry' });
    }
});

// PUT update status or details
router.put('/:id', async (req, res) => {
    try {
        const updatedEntry = await Inwardip.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(updatedEntry);
    } catch (err) {
        console.error('Error updating inward IPQC entry:', err);
        res.status(400).json({ error: 'Failed to update entry', details: err.message });
    }
});

// DELETE an inward IPQC entry
router.delete('/:id', async (req, res) => {
    try {
        await Inwardip.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete inward IPQC entry' });
    }
});

module.exports = router;
