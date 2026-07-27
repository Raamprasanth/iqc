const express = require('express');
const router = express.Router();
const RejectedIQC = require('../models/RejectedIqc');

// GET all rejected IQC entries
// ?type=reinward  → only re-inward rejected entries (isReInward: true)
// ?type=standard  → only standard rejected entries (isReInward falsy)
// (no param)      → all entries
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.type === 'reinward') {
            query.isReInward = true;
        } else if (req.query.type === 'standard') {
            query.isReInward = { $ne: true };
        }
        const entries = await RejectedIQC.find(query).sort({ date: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch rejected IQC entries' });
    }
});


// POST a new rejected IQC entry (supports single entry or bulk array)
router.post('/', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const savedEntries = await RejectedIQC.insertMany(req.body);
            return res.status(201).json(savedEntries);
        }
        const { date, model, partNo, partDescription, quantity, totalQuantity, batchId, reason, invoiceNo, grnNo, remarks } = req.body;
        const newEntry = new RejectedIQC({ date, model, partNo, partDescription, quantity, totalQuantity, batchId, reason, invoiceNo, grnNo, remarks });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create rejected IQC entry' });
    }
});

// DELETE a rejected IQC entry
router.delete('/:id', async (req, res) => {
    try {
        await RejectedIQC.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete rejected IQC entry' });
    }
});

// PUT update remarks
router.put('/:id/remarks', async (req, res) => {
    try {
        const { remarks } = req.body;
        const updatedEntry = await RejectedIQC.findByIdAndUpdate(req.params.id, { remarks }, { new: true });
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(updatedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update remarks' });
    }
});

// PUT update generic fields
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const updatedEntry = await RejectedIQC.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
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
