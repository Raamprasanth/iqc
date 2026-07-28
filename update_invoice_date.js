const fs = require('fs');
const path = require('path');

function updateModels() {
    const models = ['AcceptedIqc.js', 'Acceptedpro.js', 'RejectedIqc.js', 'Rejectedpro.js'];
    for (const model of models) {
        const filePath = path.join('backend', 'models', model);
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('invoiceDate:')) {
            content = content.replace(
                /invoiceNo: \{ type: String(.*?) \},/,
                'invoiceNo: { type: String$1 },\n    invoiceDate: { type: Date },'
            );
            fs.writeFileSync(filePath, content);
            console.log(`Updated model: ${model}`);
        }
    }
}

function updateInwardFiles() {
    const files = ['inward.html', 'inwardp.html'];
    for (const file of files) {
        const filePath = path.join('public', 'frontend', file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add data-invoicedate attribute to inputs
        if (!content.includes('data-invoicedate="${p.invoiceDate || \'\'}"')) {
            content = content.replace(
                /data-invoice="\$\{p\.invoiceNo \|\| ''\}"/g,
                'data-invoice="${p.invoiceNo || \'\'}"\n                                                        data-invoicedate="${p.invoiceDate || \'\'}"'
            );
        }

        // Add invoiceDate to baseData
        if (!content.includes("invoiceDate: input.getAttribute('data-invoicedate')")) {
            content = content.replace(
                /invoiceNo: input\.getAttribute\('data-invoice'\),/g,
                'invoiceNo: input.getAttribute(\'data-invoice\'),\n                    invoiceDate: input.getAttribute(\'data-invoicedate\'),'
            );
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated inward file: ${file}`);
    }
}

function updatePages() {
    const pages = ['acceptediqc.html', 'acceptedpro.html', 'rejectediqc.html', 'rejectedpro.html'];
    
    for (const page of pages) {
        const filePath = path.join('public', 'frontend', page);
        let content = fs.readFileSync(filePath, 'utf8');

        // Update headers
        content = content.replace(
            /<th>Date<\/th>/g,
            '<th>Inward Date</th>\n                                <th>Invoice Date</th>'
        );

        // Update groupEntries map logic
        if (content.includes('groups[key] = { date: d, invoiceNo: e.invoiceNo')) {
            content = content.replace(
                /const d = e\.date \? e\.date\.split\('T'\)\[0\] : '';/g,
                'const d = e.date ? e.date.split(\'T\')[0] : \'\';\n                  const invD = e.invoiceDate ? e.invoiceDate.split(\'T\')[0] : \'\';'
            );
            content = content.replace(
                /groups\[key\] = \{ date: d, invoiceNo:/g,
                'groups[key] = { date: d, invoiceDate: invD, invoiceNo:'
            );
        }

        // Update row rendering
        const targetRender = "<td><span class=\"cell-part\">${g.invoiceNo !== '-' ? g.invoiceNo : '<span style=\"color:var(--steel); font-weight:normal;\">N/A</span>'}</span></td>";
        const replaceRender = "<td><span class=\"cell-part\" style=\"font-weight: 500;\">${g.invoiceDate ? formatDateDisplay(g.invoiceDate) : '<span style=\"color:var(--steel); font-weight:normal;\">N/A</span>'}</span></td>\n                      <td><span class=\"cell-part\">${g.invoiceNo !== '-' ? g.invoiceNo : '<span style=\"color:var(--steel); font-weight:normal;\">N/A</span>'}</span></td>";
        
        content = content.replace(targetRender, replaceRender);

        fs.writeFileSync(filePath, content);
        console.log(`Updated page: ${page}`);
    }
}

updateModels();
updateInwardFiles();
updatePages();
