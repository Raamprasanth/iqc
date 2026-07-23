const express = require('express');
const router = express.Router();
const Part = require('../models/Part');

// GET /api/parts/models - Get unique models
router.get('/models', async (req, res) => {
    try {
        const models = await Part.distinct('model');
        res.json(models.sort());
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/parts - Get parts by model
router.get('/', async (req, res) => {
    try {
        const { model } = req.query;
        let query = {};
        if (model) {
            query.model = model;
        }
        const parts = await Part.find(query).sort({ partNo: 1 });
        res.json(parts);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


router.post('/', async (req, res) => {
    try {
        const { model, partNo, description } = req.body;
        if (!model || !partNo) return res.status(400).json({ error: 'Missing model or partNo' });
        
        const newPart = new Part({ model, partNo, description });
        await newPart.save();
        res.json(newPart);
    } catch (err) {
        console.error('Error adding part:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/parts/batch — save multiple parts for one model
router.post('/batch', async (req, res) => {
    try {
        const { model, parts } = req.body; // parts: [{partNo, description}]
        if (!model || !Array.isArray(parts) || parts.length === 0) {
            return res.status(400).json({ error: 'Missing model or parts array' });
        }
        const docs = parts
            .filter(p => p.partNo && p.partNo.trim())
            .map(p => ({ model: model.trim(), partNo: p.partNo.trim(), description: (p.description || '').trim() }));
        if (!docs.length) return res.status(400).json({ error: 'No valid parts provided' });
        const saved = await Part.insertMany(docs);
        res.json(saved);
    } catch (err) {
        console.error('Error batch adding parts:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Part.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('Error deleting part:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;

