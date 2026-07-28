const fs = require('fs');

const file = 'rejectediqc.html';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/window\.toggleSubRow = function \(id\) \{[\s\S]*?\<script\>/, `window.toggleSubRow = function (id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        };

        searchInput.addEventListener('input', renderTable);

        /* ── Export ── */
        document.getElementById('exportBtn').addEventListener('click', () => {
            const rows = [['Model', 'BLT Invoice No.', 'Received Date', 'Received Qty', 'Problem QTY', 'Problem reported date to BLT', 'Replacement Status ']];
            groupEntries(entries).forEach(g => {
                g.parts.forEach(p => {
                    rows.push([
                        g.model || '',
                        g.invoiceNo || p.invoiceNo || '',
                        g.date || '',
                        p.totalQuantity || p.receivedQty || '',
                        Number(p.quantity || p.qty || 0),
                        '',
                        p.isReplaced ? 'Replaced' : 'Replacement Pending from BLT'
                    ]);
                });
            });
            const csv = rows.map(r => r.map(c => '"' + (c == null ? '' : String(c)).replace(/"/g, '""') + '"').join(',')).join('\\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'rejected_iqc_' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        });

        /* ── Init ── */
        fetchEntries();
    </script>

    <script>`);

fs.writeFileSync(file, c);
