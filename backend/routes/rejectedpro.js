const express = require('express');
const router = express.Router();
const Rejectedpro = require('../models/Rejectedpro');

// GET all production rejected entries
router.get('/', async (req, res) => {
    try {
        const entries = await Rejectedpro.find().sort({ date: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch production rejected entries' });
    }
});

// POST a new production rejected entry
router.post('/', async (req, res) => {
    try {
        const { date, model, partNo, partDescription, quantity, totalQuantity, batchId, reason, invoiceNo, remarks, source } = req.body;
        const newEntry = new Rejectedpro({ date, model, partNo, partDescription, quantity, totalQuantity, batchId, reason, invoiceNo, remarks, source });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create production rejected entry' });
    }
});

// DELETE a production rejected entry
router.delete('/:id', async (req, res) => {
    try {
        await Rejectedpro.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete production rejected entry' });
    }
});

// PUT update generic fields
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const updatedEntry = await Rejectedpro.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(updatedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update entry' });
    }
});

module.exports = router;
