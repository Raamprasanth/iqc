const fs = require('fs');

const pages = ['public/frontend/acceptedpro.html', 'public/frontend/rejectedpro.html'];

for (const p of pages) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Add invD to groupEntries
    content = content.replace(
        /const inv = e\.invoiceNo \|\| '-';/g,
        'const inv = e.invoiceNo || \'-\';\n                  const invD = e.invoiceDate ? e.invoiceDate.split(\'T\')[0] : \'\';'
    );
    
    // Add invoiceDate to groups[key] initialization
    content = content.replace(
        /invoiceNo: inv,/g,
        'invoiceDate: invD,\n                          invoiceNo: inv,'
    );
    
    fs.writeFileSync(p, content);
    console.log("Updated " + p);
}
