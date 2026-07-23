const fs = require('fs');
let content = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/rejectedpro.html', 'utf-8');

const startStr = "/* ── Export ── */";

const fixedBlock = `/* ── Export ── */
        document.getElementById('exportBtn').addEventListener('click', () => {
            const rows = [['Sl.No.', 'Date', 'Model', 'Part No.', 'Description', 'Quantity', 'Status']];
            let sl = 1;
            groupEntries(entries).forEach(g => {
                g.parts.forEach(p => {
                    rows.push([sl++, g.date, g.model, p.partNo, p.partDescription || '', Number(p.quantity || p.qty || 0), 'Rejected']);
                });
            });
            const csv = rows.map(r => r.map(c => \`"\${String(c).replace(/"/g, '""')}"\`).join(',')).join('\\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'rejected_production_' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        });

        function renderStatusCell(g) {
            let html = \`<span class="status-pill rejected">Rejected</span>\`;
            if (g.rejections && g.rejections.length > 0) {
                const allReinspected = g.rejections.every(r => r.reInwarded);
                const allSent = g.rejections.every(r => r.sentToReInward || r.reInwarded);
                
                if (allReinspected) {
                    html += \` <span style="font-size:0.68rem;color:var(--green);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(30,123,77,0.1);border-radius:4px;">[Re-inspected]</span>\`;
                } else if (allSent) {
                    html += \` <span style="font-size:0.68rem;color:var(--amber);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(199,123,18,0.1);border-radius:4px;">[In Re-Inward]</span>\`;
                }
            }
            return html;
        }

        async function fetchReInwardCount() {`;

const match = content.indexOf(startStr);
if (match !== -1) {
    const endMatch = content.indexOf("        async function fetchReInwardCount() {", match);
    if (endMatch !== -1) {
        content = content.substring(0, match) + fixedBlock + content.substring(endMatch + "        async function fetchReInwardCount() {".length);
        fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/rejectedpro.html', content);
        console.log('Fixed rejectedpro.html');
    } else {
        console.log('End match not found');
    }
} else {
    console.log('Start match not found');
}
