const fs = require('fs');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Rename column header
    content = content.replace('<th>Bulk Quantity</th>', '<th>Inward Qty</th>');

    // 2. Update the logic for rendering the quantity
    const targetRender = "<td>${g.parts.length === 1 ? g.totalQty.toLocaleString('en-IN') : '-'}</td>";
    const newRender = "<td>${g.parts.length > 0 && g.parts.every(p => Number(p.quantity || p.qty || 0) === Number(g.parts[0].quantity || g.parts[0].qty || 0)) ? Number(g.parts[0].quantity || g.parts[0].qty || 0).toLocaleString('en-IN') : '-'}</td>";
    
    content = content.replace(targetRender, newRender);

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

updateFile('public/frontend/inward.html');
updateFile('public/frontend/inwardp.html');
