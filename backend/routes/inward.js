const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const modelsToClean = [
    '../models/AcceptedIqc', '../models/RejectedIqc', 
    '../models/Acceptedpro', '../models/Rejectedpro',
    '../models/Acceptedip', '../models/Rejectedip', 
    '../models/ReInwardIp', '../models/ReInwardPro', 
    '../models/Inwardip', '../models/InPqc'
];
modelsToClean.forEach(m => { try { require(m); } catch(e){} });

const Inward = require('../models/Inward');

// GET all inward entries
router.get('/', async (req, res) => {
    try {
        const entries = await Inward.find().sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error('Error fetching inward entries:', err);
        res.status(500).json({ error: 'Server error fetching inward entries' });
    }
});

// POST new inward entry
router.post('/', async (req, res) => {
    try {
        const newEntry = new Inward(req.body);
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error('Error saving inward entry:', err);
        res.status(400).json({ error: 'Failed to save entry', details: err.message });
    }
});

// PUT update status or details
router.put('/:id', async (req, res) => {
    try {
        const updatedEntry = await Inward.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(updatedEntry);
    } catch (err) {
        console.error('Error updating inward entry:', err);
        res.status(400).json({ error: 'Failed to update entry', details: err.message });
    }
});

// DELETE an inward entry
router.delete('/:id', async (req, res) => {
    try {
        const deletedEntry = await Inward.findByIdAndDelete(req.params.id);
        if (!deletedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        
        // Cascading delete across other collections if invoiceNo exists
        if (deletedEntry.invoiceNo && deletedEntry.invoiceNo !== '-') {
            const invoiceNo = deletedEntry.invoiceNo;
            const partNo = deletedEntry.partNo;
            const filter = { invoiceNo, partNo };
            
            const models = [
                'AcceptedIQC', 'RejectedIQC', 'Acceptedpro', 'Rejectedpro',
                'Acceptedip', 'Rejectedip', 'ReInwardIp', 'ReInwardPro', 'Inwardip', 'InPqc'
            ];
            
            const promises = [];
            for (const m of models) {
                try {
                    const Model = mongoose.model(m);
                    if (Model) promises.push(Model.deleteMany(filter).catch(e => {}));
                } catch(e) {
                    // Model might not be registered, skip
                }
            }
            await Promise.all(promises);
        }
        
        res.json({ message: 'Entry deleted successfully' });
    } catch (err) {
        console.error('Error deleting entry:', err);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

module.exports = router;
