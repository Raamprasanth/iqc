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

const Inwardp = require('../models/Inwardp');

// GET all production inward entries
router.get('/', async (req, res) => {
    try {
        const entries = await Inwardp.find().sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        console.error('Error fetching production inward entries:', err);
        res.status(500).json({ error: 'Server error fetching production inward entries' });
    }
});

// POST new production inward entry (supports single entry or bulk array)
router.post('/', async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            const savedEntries = await Inwardp.insertMany(req.body);
            return res.status(201).json(savedEntries);
        }
        const newEntry = new Inwardp(req.body);
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        console.error('Error saving production inward entry:', err);
        res.status(400).json({ error: 'Failed to save entry', details: err.message });
    }
});

// PUT bulk update inwardp entries
router.put('/bulk', async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: 'Expected array of updates' });
        }
        const ops = req.body.map(item => {
            const { _id, ...updateData } = item;
            return {
                updateOne: {
                    filter: { _id },
                    update: { $set: updateData }
                }
            };
        });
        await Inwardp.bulkWrite(ops);
        res.json({ message: 'Bulk update successful' });
    } catch (err) {
        console.error('Error bulk updating inwardp entries:', err);
        res.status(400).json({ error: 'Failed bulk update', details: err.message });
    }
});

// PUT update status or details
router.put('/:id', async (req, res) => {
    try {
        const updatedEntry = await Inwardp.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(updatedEntry);
    } catch (err) {
        console.error('Error updating production inward entry:', err);
        res.status(400).json({ error: 'Failed to update entry', details: err.message });
    }
});

// DELETE a production inward entry
router.delete('/:id', async (req, res) => {
    try {
        const deletedEntry = await Inwardp.findByIdAndDelete(req.params.id);
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
