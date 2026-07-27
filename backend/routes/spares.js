const express = require('express');
const router = express.Router();
const Spare = require('../models/Spare');

// GET all spares or filter by model/partDescription
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.model) query.model = req.query.model;
        if (req.query.partDescription) query.partDescription = req.query.partDescription;
        
        const spares = await Spare.find(query).sort({ model: 1, partDescription: 1 });
        res.json(spares);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create new spare record
router.post('/', async (req, res) => {
    try {
        const { model, partDescription, subParts } = req.body;
        if (!model || !partDescription) {
            return res.status(400).json({ error: 'Model and Part Description are required.' });
        }

        const cleanedSubParts = Array.isArray(subParts) 
            ? subParts.map(s => String(s).trim()).filter(Boolean)
            : [];

        const spare = new Spare({
            model: model.trim(),
            partDescription: partDescription.trim(),
            subParts: cleanedSubParts
        });

        const savedSpare = await spare.save();
        res.status(201).json(savedSpare);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update spare record by ID
router.put('/:id', async (req, res) => {
    try {
        const { model, partDescription, subParts } = req.body;
        const updateData = {};
        if (model) updateData.model = model.trim();
        if (partDescription) updateData.partDescription = partDescription.trim();
        if (Array.isArray(subParts)) {
            updateData.subParts = subParts.map(s => String(s).trim()).filter(Boolean);
        }

        const updatedSpare = await Spare.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updatedSpare) {
            return res.status(404).json({ error: 'Spare record not found.' });
        }
        res.json(updatedSpare);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE spare record by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedSpare = await Spare.findByIdAndDelete(req.params.id);
        if (!deletedSpare) {
            return res.status(404).json({ error: 'Spare record not found.' });
        }
        res.json({ message: 'Spare record deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
