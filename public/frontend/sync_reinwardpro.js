const fs = require('fs');

const src = fs.readFileSync('reinward.html', 'utf8');
let dest = fs.readFileSync('reinwardpro.html', 'utf8');

// 1. Copy the main table headers
const theadMatch = src.match(/<thead>[\s\S]*?<\/thead>/);
if (theadMatch) {
    dest = dest.replace(/<thead>[\s\S]*?<\/thead>/, theadMatch[0]);
}

// 2. Replace the JS `renderTable` function entirely
const srcRenderMatch = src.match(/function renderTable\(\) \{[\s\S]*?(?=\n\s*window\.toggleSubRow)/);
if (srcRenderMatch) {
    dest = dest.replace(/function renderTable\(\) \{[\s\S]*?(?=\n\s*window\.toggleSubRow)/, srcRenderMatch[0]);
}

// 3. Remove `calcReject` and `processInspection` from reinwardpro.html since they aren't needed anymore
dest = dest.replace(/window\.calcReject = function[\s\S]*?};\s*/, '');
dest = dest.replace(/window\.processInspection = async function[\s\S]*?};\s*/, '');

fs.writeFileSync('reinwardpro.html', dest);
console.log("Updated reinwardpro.html to be like reinward.html");
