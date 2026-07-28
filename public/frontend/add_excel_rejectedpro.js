const fs = require('fs');

let content = fs.readFileSync('rejectedpro.html', 'utf8');

// 1. Add Action header
const headerTarget = /<th>Model<\/th>\s*<th><\/th>/i;
content = content.replace(headerTarget, `<th>Model</th>
                                <th style="text-align:center;">Action</th>
                                <th></th>`);

// 2. Add downloadInvoiceExcel function
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
                ['Sl. No.', 'Date', 'Invoice No.', 'Model', 'Part No.', 'Part Description', 'Remarks (Nature)', 'SN', 'Spare', 'Qty', 'Replacement Status', 'Rep Serial No', 'Addl Remarks']
            ];

            let sl = 1;
            g.parts.forEach(p => {
                if (p.itemDetails && p.itemDetails.length > 0) {
                    p.itemDetails.forEach(item => {
                        if (!item.isReplaced) {
                            rows.push([
                                sl++,
                                formatDateDisplay(g.date),
                                g.invoiceNo || p.invoiceNo || '',
                                g.model || p.model || '',
                                p.partNo || '',
                                p.partDescription || '',
                                item.nature || '',
                                item.serial || '',
                                item.spare || '',
                                item.qty || 1,
                                item.isReplaced ? 'Replaced' : 'Replacement Pending from BLT',
                                item.repSerialNo || '',
                                item.additionalRemarks || ''
                            ]);
                        }
                    });
                } else {
                    rows.push([
                        sl++,
                        formatDateDisplay(g.date),
                        g.invoiceNo || p.invoiceNo || '',
                        g.model || p.model || '',
                        p.partNo || '',
                        p.partDescription || '',
                        p.remarks || p.reason || '',
                        '',
                        '',
                        Number(p.quantity || p.qty || 0),
                        p.isReplaced ? 'Replaced' : 'Replacement Pending from BLT',
                        '',
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
            a.download = \`Rejected_PRO_\${invName}.csv\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        function renderTable() {`;
content = content.replace(/function renderTable\(\) \{/, funcCode);

// 3. Add button cell to the row
const cellTarget = /<td><span class="cell-part">\$\{g\.model\}<\/span><\/td>\s*<td style="text-align: right;">/i;
const cellCode = `<td><span class="cell-part">\${g.model}</span></td>
                    
                    <td style="text-align:center;" onclick="event.stopPropagation()">
                        <button onclick="downloadInvoiceExcel(\${i})" class="btn-outline-navy" style="padding:4px 10px; font-size:0.75rem; display:inline-flex; align-items:center; gap:5px; border-radius:6px; cursor:pointer;" title="Download Excel for this invoice">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Excel
                        </button>
                    </td>
                    <td style="text-align: right;">`;
content = content.replace(cellTarget, cellCode);

fs.writeFileSync('rejectedpro.html', content);
console.log('Modified rejectedpro.html');
