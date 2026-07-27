const express = require('express');
const router = express.Router();
const AcceptedIQC = require('../models/AcceptedIqc');

// GET all accepted IQC entries
// ?type=reinward  → only re-inward accepted entries (isReInward: true)
// ?type=standard  → only standard accepted entries (isReInward falsy)
// (no param)      → all entries (excluding Completed)
router.get('/', async (req, res) => {
    try {
        let query = { status: { $ne: 'Completed' } };
        if (req.query.type === 'reinward') {
            query.isReInward = true;
        } else if (req.query.type === 'standard') {
            query.isReInward = { $ne: true };
        }
        const entries = await AcceptedIQC.find(query).sort({ date: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch accepted IQC entries' });
    }
});




// POST a new accepted IQC entry (supports single entry or bulk array)
router.post('/', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const savedEntries = await AcceptedIQC.insertMany(req.body);
            return res.status(201).json(savedEntries);
        }
        const { date, model, partNo, partDescription, quantity, totalQuantity, batchId, invoiceNo, grnNo, remarks } = req.body;
        const newEntry = new AcceptedIQC({ date, model, partNo, partDescription, quantity, totalQuantity, batchId, invoiceNo, grnNo, remarks });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create accepted IQC entry' });
    }
});

// DELETE an accepted IQC entry
router.delete('/:id', async (req, res) => {
    try {
        await AcceptedIQC.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete accepted IQC entry' });
    }
});

// PUT update quantity by batchId and partNo (from inwardp rejection step)
router.put('/update-qty', async (req, res) => {
    try {
        const { batchId, partNo, newQty } = req.body;
        const entry = await AcceptedIQC.findOne({ batchId, partNo });
        if (entry) {
            entry.quantity = newQty;
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

// PUT /set-yet-to-accept  — set initial yetToAcceptQty when rejection is processed
router.put('/set-yet-to-accept', async (req, res) => {
    try {
        const { batchId, partNo, yetToAcceptQty } = req.body;
        const entry = await AcceptedIQC.findOne({ batchId, partNo });
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

// PUT /reduce-yet-to-accept  — reduce yetToAcceptQty and record history when tick is clicked in rejectediqc
router.put('/reduce-yet-to-accept', async (req, res) => {
    try {
        const { batchId, partNo, reduceBy, source } = req.body;
        const entry = await AcceptedIQC.findOne({ batchId, partNo });
        if (entry) {
            const prevQty = entry.yetToAcceptQty || 0;
            entry.yetToAcceptQty = Math.max(0, prevQty - (reduceBy || 1));
            entry.yetToAcceptUpdatedAt = new Date();
            if (!entry.yetToAcceptHistory) entry.yetToAcceptHistory = [];
            entry.yetToAcceptHistory.unshift({
                reducedBy: reduceBy || 1,
                updatedAt: new Date(),
                source: source || 'IQC'
            });
            // Keep only last 10 history entries
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

// PUT /:id  — generic update for a single entry
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const updated = await AcceptedIQC.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

