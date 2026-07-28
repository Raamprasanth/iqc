const fs = require('fs');

const files = [
    'acceptediqc.html',
    'acceptedpro.html',
    'rejectediqc.html',
    'rejectedpro.html'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove headers
    content = content.replace(/<th(?:[^>]*)>Total Parts<\/th>\s*<th(?:[^>]*)>Total Quantity<\/th>/gi, '');

    // Remove data columns
    // Pattern: <td><strong>${g.parts.length}</strong> Parts</td>\s*<td>${g.totalQty.toLocaleString('en-IN')}</td>
    const dataRegex = /<td(?:[^>]*)><strong>\$\{g\.parts\.length\}<\/strong>\s*Parts<\/td>\s*<td(?:[^>]*)>\$\{g\.totalQty\.toLocaleString\('en-IN'\)\}<\/td>/gi;
    content = content.replace(dataRegex, '');

    fs.writeFileSync(file, content);
    console.log("Processed", file);
});
