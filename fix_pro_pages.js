const fs = require('fs');

const pages = ['public/frontend/acceptedpro.html', 'public/frontend/rejectedpro.html'];

for (const p of pages) {
    let content = fs.readFileSync(p, 'utf8');

    // 1. Headers
    content = content.replace(
        /<th>Date<\/th>/g,
        '<th>Inward Date</th>\n                                <th>Invoice Date</th>'
    );

    // 2. groupEntries logic
    content = content.replace(
        /const d = e\.date \? e\.date\.split\('T'\)\[0\] : '-';/g,
        'const d = e.date ? e.date.split(\'T\')[0] : \'-\';'
    );
    // ensure no duplicate replacements
    
    // For acceptedpro and rejectedpro they use: `const inv = e.invoiceNo || '-';`
    content = content.replace(
        /const inv = e\.invoiceNo \|\| '-';/g,
        'const inv = e.invoiceNo || \'-\';\n                const invD = e.invoiceDate ? e.invoiceDate.split(\'T\')[0] : \'\';'
    );

    // Initialize groups[key] with invoiceDate
    if (p.includes('acceptedpro')) {
        content = content.replace(
            /date: d,\s*invoiceNo: inv,/g,
            'date: d,\n                        invoiceDate: invD,\n                        invoiceNo: inv,'
        );
    } else if (p.includes('rejectedpro')) {
        content = content.replace(
            /date: d, invoiceNo: inv,/g,
            'date: d, invoiceDate: invD, invoiceNo: inv,'
        );
    }

    // 3. Row rendering logic
    const rowMatch = /<td><span class="cell-part">\$\{formatDateDisplay\(g\.date\)\}<\/span><\/td>\s*<td><span class="cell-part" style="font-weight:\s*500;">\$\{g\.invoiceNo \|\| '-'\}<\/span><\/td>/;
    
    const replacement = '<td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>\n                    <td><span class="cell-part" style="font-weight: 500;">${g.invoiceDate ? formatDateDisplay(g.invoiceDate) : \'<span style="color:var(--steel); font-weight:normal;">N/A</span>\'}</span></td>\n                    <td><span class="cell-part" style="font-weight: 500;">${g.invoiceNo || \'-\'}</span></td>';
    
    content = content.replace(rowMatch, replacement);

    fs.writeFileSync(p, content);
    console.log(`Updated ${p}`);
}
