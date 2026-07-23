const fs = require('fs');

let js = fs.readFileSync('backend/routes/parts.js', 'utf8');

const routes = `
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
`;

if (!js.includes('router.post')) {
    js = js.replace('module.exports = router;', routes);
    fs.writeFileSync('backend/routes/parts.js', js);
    console.log('Added POST and DELETE routes to parts.js');
} else {
    console.log('Routes already exist');
}
