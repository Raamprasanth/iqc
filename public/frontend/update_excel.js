const fs = require('fs');

const funcCode = `
        /* ── Per-Invoice Excel Download ── */
        window.downloadInvoiceExcel = function (groupIndex) {
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const filtered = entries.filter(e => !e.isReplaced).filter(e =>
                !query ||
                (e.model && e.model.toLowerCase().includes(query)) ||
                (e.partNo && e.partNo.toLowerCase().includes(query)) ||
                (e.partDescription && e.partDescription.toLowerCase().includes(query))
            );
            const grouped = groupEntries(filtered);
            const g = grouped[groupIndex];
            if (!g) return;

            const rows = [
                ['Inward Date', 'Invoice NO', 'Inward Qty', 'Part No', 'Defective Items', 'Problem Description', 'Spares Required', 'Required Qty', 'Serial No / Lot No']
            ];

            g.parts.forEach(p => {
                const inwardQty = Number(p.totalQuantity || p.receivedQty || p.quantity || p.qty || 0);
                if (p.itemDetails && p.itemDetails.length > 0) {
                    p.itemDetails.forEach(item => {
                        if (!item.isReplaced) {
                            rows.push([
                                formatDateDisplay(g.date),
                                g.invoiceNo || p.invoiceNo || '',
                                inwardQty,
                                p.partNo || '',
                                p.partDescription || '',
                                item.nature || '',
                                item.spare || '',
                                item.qty || 1,
                                item.serial || ''
                            ]);
                        }
                    });
                } else {
                    rows.push([
                        formatDateDisplay(g.date),
                        g.invoiceNo || p.invoiceNo || '',
                        inwardQty,
                        p.partNo || '',
                        p.partDescription || '',
                        p.remarks || p.reason || '',
                        '',
                        Number(p.quantity || p.qty || 0),
                        ''
                    ]);
                }
            });

            const csvContent = rows.map(r => r.map(c => '"' + (c == null ? '' : String(c)).replace(/"/g, '""') + '"').join(',')).join('\\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const invName = (g.invoiceNo && g.invoiceNo !== '-') ? g.invoiceNo.replace(/[^a-zA-Z0-9_-]/g, '_') : ('invoice_' + (groupIndex + 1));
            a.download = \`Rejected_Items_\${invName}.csv\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
`;

function replaceDownloadExcel(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace everything from window.downloadInvoiceExcel = function ... up to function renderTable() {
    const regex = /\/\*\s*──\s*Per-Invoice Excel Download\s*──\s*\*\/[\s\S]*?(?=function renderTable\(\) \{)/;
    
    if (regex.test(content)) {
        content = content.replace(regex, funcCode + '\n        ');
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    } else {
        console.log("Could not find downloadInvoiceExcel in", file);
    }
}

replaceDownloadExcel('rejectediqc.html');
replaceDownloadExcel('rejectedpro.html');
