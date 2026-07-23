const fs = require('fs');

function updateRouteFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we have mongoose required
    if (!content.includes("const mongoose = require('mongoose');")) {
        content = content.replace("const express = require('express');", "const express = require('express');\nconst mongoose = require('mongoose');");
    }

    // Add require statements for models
    const requires = `
const modelsToClean = [
    '../models/AcceptedIqc', '../models/RejectedIqc', 
    '../models/Acceptedpro', '../models/Rejectedpro',
    '../models/Acceptedip', '../models/Rejectedip', 
    '../models/ReInwardIp', '../models/ReInwardPro', 
    '../models/Inwardip', '../models/InPqc'
];
modelsToClean.forEach(m => { try { require(m); } catch(e){} });
`;
    if (!content.includes("modelsToClean")) {
        content = content.replace("const router = express.Router();", "const router = express.Router();\n" + requires);
    }

    const deleteRegex = /router\.delete\('\/:id',\s*async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Failed to delete entry' \}\);\s*\}\s*\}\);/;
    
    const ModelName = filePath.includes('inwardp.js') ? 'Inwardp' : 'Inward';

    const newDelete = `router.delete('/:id', async (req, res) => {
    try {
        const deletedEntry = await ${ModelName}.findByIdAndDelete(req.params.id);
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
});`;

    if (deleteRegex.test(content)) {
        content = content.replace(deleteRegex, newDelete);
        fs.writeFileSync(filePath, content);
        console.log("Updated " + filePath);
    } else {
        console.log("Regex failed for " + filePath);
    }
}

updateRouteFile('backend/routes/inward.js');
updateRouteFile('backend/routes/inwardp.js');
