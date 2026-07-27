const express = require('express');
const router = express.Router();
const Acceptedpro = require('../models/Acceptedpro');

// GET all production accepted entries (exclude Completed)
router.get('/', async (req, res) => {
    try {
        const entries = await Acceptedpro.find({ status: { $ne: 'Completed' } }).sort({ date: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch production accepted entries' });
    }
});

// POST a new production accepted entry (supports single entry or bulk array)
router.post('/', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const savedEntries = await Acceptedpro.insertMany(req.body);
            return res.status(201).json(savedEntries);
        }
        const { date, model, partNo, partDescription, quantity, totalQuantity, batchId, invoiceNo, remarks, yetToAcceptQty } = req.body;
        const newEntry = new Acceptedpro({ date, model, partNo, partDescription, quantity, totalQuantity, batchId, invoiceNo, remarks, yetToAcceptQty });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create production accepted entry' });
    }
});

// DELETE a production accepted entry
router.delete('/:id', async (req, res) => {
    try {
        await Acceptedpro.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete production accepted entry' });
    }
});

// PUT /set-yet-to-accept — set initial yetToAcceptQty
router.put('/set-yet-to-accept', async (req, res) => {
    try {
        const { batchId, partNo, yetToAcceptQty } = req.body;
        const entry = await Acceptedpro.findOne({ batchId, partNo });
        if (entry) {
            entry.yetToAcceptQty = yetToAcceptQty;
            await entry.save();
            res.json(entry);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /reduce-yet-to-accept — reduce yetToAcceptQty and record history
router.put('/reduce-yet-to-accept', async (req, res) => {
    try {
        const { batchId, partNo, reduceBy, source } = req.body;
        const entry = await Acceptedpro.findOne({ batchId, partNo });
        if (entry) {
            const prevQty = entry.yetToAcceptQty || 0;
            entry.yetToAcceptQty = Math.max(0, prevQty - (reduceBy || 1));
            entry.yetToAcceptUpdatedAt = new Date();
            if (!entry.yetToAcceptHistory) entry.yetToAcceptHistory = [];
            entry.yetToAcceptHistory.unshift({
                reducedBy: reduceBy || 1,
                updatedAt: new Date(),
                source: source || 'PRO'
            });
            entry.yetToAcceptHistory = entry.yetToAcceptHistory.slice(0, 10);
            await entry.save();
            res.json(entry);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
