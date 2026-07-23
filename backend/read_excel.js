const xlsx = require('xlsx');

try {
    const workbook = xlsx.readFile('../models.xlsx');
    const parts = [];
    
    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        let currentModel = null;
        for (const row of data) {
            const keys = Object.keys(row);
            const modelKey = keys.find(k => k.trim().toLowerCase() === 'model');
            const partNoKey = keys.find(k => k.trim().toLowerCase() === 'part no.');
            const descKey = keys.find(k => k.trim().toLowerCase() === 'part description');
            
            if (modelKey && row[modelKey]) {
                currentModel = row[modelKey].trim();
            }
            
            if (partNoKey && descKey && row[partNoKey] && row[descKey]) {
                parts.push({
                    model: currentModel || sheetName.trim(), // fallback to sheet name if no model
                    partNo: String(row[partNoKey]).trim(),
                    description: String(row[descKey]).trim()
                });
            }
        }
    }
    
    const uniqueModels = [...new Set(parts.map(p => p.model))];
    console.log("Models:", uniqueModels);
    console.log("\nModel 2 (", uniqueModels[1], ") parts:");
    console.log(parts.filter(p => p.model === uniqueModels[1]).slice(0, 3));
    console.log("\nModel 3 (", uniqueModels[2], ") parts:");
    console.log(parts.filter(p => p.model === uniqueModels[2]).slice(0, 3));
} catch (err) {
    console.error(err);
}
