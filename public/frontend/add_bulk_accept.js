const fs = require('fs');

function addBulkAccept(file) {
    let content = fs.readFileSync(file, 'utf8');

    const newDiv = `<div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; padding-top: 15px;">
                                <input type="number" id="bulkAccept-\${i}" placeholder="Bulk Accept Qty" style="width: 130px; padding: 6px; border: 1px solid var(--fog); border-radius: 4px;" min="0" />
                                <button onclick="applyBulkAccept(\${i})" type="button" class="btn-outline-navy" style="padding: 6px 12px; font-size: 0.8rem;">Apply</button>
                                <button onclick="processInspection(\${i})" style="background: var(--navy); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem;">Save Inspection</button>
                            </div>`;

    // Regex to match the div robustly
    const regex = /<div style="text-align: right; padding-top: 15px;">\s*<button onclick="processInspection\(\$\{i\}\)" style="background: var\(--navy\); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0\.8rem;">Save Inspection<\/button>\s*<\/div>/g;

    if (regex.test(content)) {
        content = content.replace(regex, newDiv);
        console.log("Replaced div in", file);
    } else {
        console.log("Could not find Save Inspection div in", file);
    }

    const funcRegex = /function applyBulkAccept\(index\)/;
    if(!funcRegex.test(content)) {
        const func = `
        function applyBulkAccept(index) {
            const bulkVal = document.getElementById(\`bulkAccept-\${index}\`).value;
            if (!bulkVal || Number(bulkVal) < 0) return;
            
            const tbody = document.getElementById(\`subrow-body-\${index}\`);
            if(!tbody) return;
            
            const inputs = tbody.querySelectorAll('.accept-input');
            inputs.forEach(inp => {
                const total = Number(inp.getAttribute('data-total') || 0);
                const val = Math.min(Number(bulkVal), total);
                inp.value = val;
                
                // Trigger calculation and auto-save
                const id = inp.getAttribute('data-id');
                if (id && typeof calcReject === 'function') {
                    calcReject(inp, \`rej-\${id}\`);
                    if(typeof autoSaveInward === 'function') autoSaveInward(id, true);
                    if(typeof autoSaveInwardp === 'function') autoSaveInwardp(id, true);
                }
            });
        }
    </script>
</body>`;
        content = content.replace(/<\/script>\s*<\/body>/, func);
    }

    fs.writeFileSync(file, content);
}

addBulkAccept('inward.html');
addBulkAccept('inwardp.html');
console.log("Done");
