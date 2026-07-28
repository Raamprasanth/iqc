const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Wrap the div with an if condition to hide it if all parts are inspected
    const divRegex = /<div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; padding-top: 15px;">[\s\S]*?<\/div>/g;
    content = content.replace(divRegex, match => {
        if (match.includes('g.parts.every')) return match; // already wrapped
        return `\${!g.parts.every(p => p.inspected) ? \`\n                            ${match.trim()}\n                            \` : ''}`;
    });

    // 2. Append applyBulkAccept function if it doesn't exist
    if (!content.includes('function applyBulkAccept(index)')) {
        const func = `
    <script>
        window.applyBulkAccept = function(index) {
            const bulkVal = document.getElementById('bulkAccept-' + index).value;
            if (!bulkVal || Number(bulkVal) < 0) return;
            
            const tbody = document.getElementById('subrow-body-' + index);
            if(!tbody) return;
            
            const inputs = tbody.querySelectorAll('.accept-input');
            inputs.forEach(inp => {
                const total = Number(inp.getAttribute('data-total') || 0);
                const val = Math.min(Number(bulkVal), total);
                inp.value = val;
                
                // Trigger calculation and auto-save
                const id = inp.getAttribute('data-id');
                if (id && typeof window.calcReject === 'function') {
                    window.calcReject(inp, 'rej-' + id);
                    if(typeof window.autoSaveInward === 'function') window.autoSaveInward(id, true);
                    if(typeof window.autoSaveInwardp === 'function') window.autoSaveInwardp(id, true);
                }
            });
        };
    </script>
</body>`;
        content = content.replace(/<\/body>/i, func);
    }

    fs.writeFileSync(file, content);
    console.log("Fixed", file);
}

fixFile('inward.html');
fixFile('inwardp.html');
console.log("Done");
