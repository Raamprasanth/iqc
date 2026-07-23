const fs = require('fs');

function applyAutoSave(filePath, apiRoute) {
    if (!fs.existsSync(filePath)) return;
    let html = fs.readFileSync(filePath, 'utf8');

    // Replace onchange with oninput for the inputs
    html = html.replace(/onchange="updateSubItemField/g, 'oninput="updateSubItemField');

    // Replace the function implementation
    const oldFuncRegex = /async function updateSubItemField[\s\S]*?\}|function updateSubItemField[\s\S]*?\}/;
    
    const newFunc = `const updateTimers = {};
        async function updateSubItemField(id, index, field, value) {
            const entry = entries.find(e => e._id === id);
            if (!entry || !entry.itemDetails || !entry.itemDetails[index]) return;
            entry.itemDetails[index][field] = value;
            
            const timerKey = id + '-' + index;
            clearTimeout(updateTimers[timerKey]);
            
            updateTimers[timerKey] = setTimeout(async () => {
                try {
                    await fetch('${apiRoute}' + id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemDetails: entry.itemDetails })
                    });
                } catch (err) {
                    console.error('Failed to auto-save:', err);
                }
            }, 600);
        }`;

    html = html.replace(oldFuncRegex, newFunc);
    fs.writeFileSync(filePath, html);
    console.log('Updated ' + filePath);
}

applyAutoSave('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/rejectediqc.html', '/api/rejected-iqc/');
applyAutoSave('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/rejectedpro.html', '/api/rejectedpro/');
