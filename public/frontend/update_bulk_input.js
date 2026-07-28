const fs = require('fs');

function updateBulkInput(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Look for the bulkAccept input
    // <input type="number" id="bulkAccept-${i}" placeholder="Bulk Accept Qty" style="width: 130px; padding: 6px; border: 1px solid var(--fog); border-radius: 4px;" min="0" />
    const regex = /<input type="number" id="bulkAccept-\$\{i\}" placeholder="Bulk Accept Qty" style="([^"]*)" min="0" \/>/g;
    
    if (regex.test(content)) {
        content = content.replace(regex, '<input type="number" id="bulkAccept-${i}" value="${g.totalQty}" placeholder="Bulk Accept Qty" style="$1" min="0" />');
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    } else {
        console.log("Could not find bulkAccept input in", file);
    }
}

updateBulkInput('inward.html');
updateBulkInput('inwardp.html');
