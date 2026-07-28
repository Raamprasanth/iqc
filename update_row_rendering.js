const fs = require('fs');
const path = require('path');

function updatePagesRowRendering() {
    const pages = ['acceptediqc.html', 'acceptedpro.html', 'rejectediqc.html', 'rejectedpro.html'];
    
    for (const page of pages) {
        const filePath = path.join('public', 'frontend', page);
        let content = fs.readFileSync(filePath, 'utf8');

        // Look for <td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>
        const regex = /<td><span class="cell-part">\$\{formatDateDisplay\(g\.date\)\}<\/span><\/td>\s*<td><span class="cell-part">\$\{g\.invoiceNo([^<]*)\}<\/span><\/td>/g;
        
        const replaceRender = '<td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>\n                      <td><span class="cell-part" style="font-weight: 500;">${g.invoiceDate ? formatDateDisplay(g.invoiceDate) : \'<span style="color:var(--steel); font-weight:normal;">N/A</span>\'}</span></td>\n                      <td><span class="cell-part">${g.invoiceNo$1}</span></td>';
        
        if (regex.test(content)) {
            content = content.replace(regex, replaceRender);
            fs.writeFileSync(filePath, content);
            console.log(`Updated row rendering in page: ${page}`);
        } else {
            console.log(`Regex not matched in ${page}`);
        }
    }
}

updatePagesRowRendering();
