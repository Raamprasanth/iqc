const fs = require('fs');
let html = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', 'utf8');

// Replace table header
html = html.replace(
    /id="tableWrap"[\s\S]*?<\/thead>/,
    `id="tableWrap" style="background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; display: none;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead style="background: var(--fog); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">
                <tr>
                    <th style="padding:16px 20px; font-weight:600; color:var(--navy); text-align:left; border-bottom:2px solid var(--fog);">Invoice No.</th>
                    <th style="padding:16px 20px; font-weight:600; color:var(--navy); text-align:left; border-bottom:2px solid var(--fog);">Date</th>
                    <th style="padding:16px 20px; font-weight:600; color:var(--navy); text-align:left; border-bottom:2px solid var(--fog);">Model</th>
                    <th style="padding:16px 20px; font-weight:600; color:var(--navy); text-align:left; border-bottom:2px solid var(--fog);">Actions</th>
                </tr>
            </thead>`
);

const newJS = `        function groupEntries(mainData) {
            const groups = {};
            mainData.forEach(e => {
                const d = e.date ? e.date.split('T')[0] : '';
                const key = (e.invoiceNo && e.invoiceNo !== '-') ? e.invoiceNo : (e.batchId ? e.batchId : (d + '|' + e.model));
                if (!groups[key]) {
                    groups[key] = { 
                        invoiceNo: e.invoiceNo || '-', 
                        date: d, 
                        model: e.model, 
                        parts: [], 
                        ids: [] 
                    };
                }
                groups[key].parts.push(e);
                groups[key].ids.push(e._id);
            });
            return Object.values(groups);
        }

        function updateUI() {
            const currentSet = dataSets[activeTab];
            const query = searchInput.value.trim().toLowerCase();

            // Filter main entries by search
            const filteredMain = currentSet.main.filter(e =>
                !query ||
                (e.model && e.model.toLowerCase().includes(query)) ||
                (e.partNo && e.partNo.toLowerCase().includes(query)) ||
                (e.partDescription && e.partDescription.toLowerCase().includes(query))
            );

            // Group filtered entries
            const grouped = groupEntries(filteredMain);
            const totalLots = grouped.length;
            
            let totalPartLines = 0;
            let totalQty = 0;
            
            grouped.forEach(g => {
                totalPartLines += g.parts.length;
                g.parts.forEach(p => {
                    totalQty += Number(p.quantity || p.qty || 0);
                });
            });

            // Update KPI Displays
            document.getElementById('kpiLots').textContent = totalLots;
            document.getElementById('kpiParts').textContent = totalPartLines;
            
            if (document.getElementById('kpiInwardQty')) document.getElementById('kpiInwardQty').textContent = totalQty.toLocaleString('en-IN');
            if (document.getElementById('kpiFinalQty')) document.getElementById('kpiFinalQty').textContent = totalQty.toLocaleString('en-IN');
            if (document.getElementById('kpiIqcQty')) document.getElementById('kpiIqcQty').textContent = '-';
            if (document.getElementById('kpiProQty')) document.getElementById('kpiProQty').textContent = '-';

            if (totalLots === 0) {
                tableWrap.style.display = 'none';
                emptyState.style.display = 'flex';
                return;
            }

            tableWrap.style.display = 'block';
            emptyState.style.display = 'none';

            let htmlStr = '';
            grouped.forEach((g, i) => {
                const jsonStr = JSON.stringify(g.parts).replace(/'/g, "&#39;");
                htmlStr += \`
                <tr class="main-row" onclick="toggleSubrow(\${i})">
                    <td><span class="cell-part" style="font-weight: 700; color: var(--navy);">\${g.invoiceNo}</span></td>
                    <td><span class="cell-part">\${formatDateDisplay(g.date)}</span></td>
                    <td><span class="cell-part">\${g.model}</span></td>
                    <td>
                        <button class="btn-outline-navy" style="padding: 6px 12px; font-size: 0.8rem; pointer-events: none;">
                            View \${g.parts.length} Parts
                        </button>
                        \${activeTab === 'accepted' ? \`<button onclick="event.stopPropagation(); sendLotToReInward('\${jsonStr}', this)" style="margin-left:8px; padding: 4px 10px; font-size: 0.68rem; background: var(--navy); color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'Calibri', Calibri, sans-serif; font-weight: 600; transition: background 0.15s; outline: none;" onmouseover="this.style.background='#1A2B3C'" onmouseout="this.style.background='var(--navy)'">Send to Completed</button>\` : ''}
                    </td>
                </tr>
                <tr id="subrow-\${i}" style="display: none; background: #fafbfc;">
                    <td colspan="4" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 16px; background: white; margin: 12px; border-radius: 8px; border: 1px solid var(--fog); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                <thead>
                                    <tr>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Part No</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Description</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Quantity</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Serial No</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Remarks</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Stage</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: center; color: var(--steel);">History</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${g.parts.map(p => \`
                                        <tr>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;"><strong>\${p.partNo}</strong></td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9; color: var(--steel);">\${p.partDescription || p.description || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;"><strong>\${Number(p.quantity || p.qty || 0).toLocaleString('en-IN')}</strong></td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">\${p.repSerialNo || p.problemSerialNo || p.recvSerialNo || p.serial || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">\${p.additionalRemarks || p.remarks || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">
                                                <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 12px; background: \${activeTab==='accepted' ? 'var(--mint)' : 'rgba(239, 71, 111, 0.1)'}; color: \${activeTab==='accepted' ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">\${p.stage || 'IQC'}</span>
                                            </td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                                                <button class="btn-outline-navy" style="padding:4px 8px; font-size:0.75rem;" onclick="viewHistory('\${p.partNo}')">View History</button>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>\`;
            });
            tableBody.innerHTML = htmlStr;
        }

        function renderQtyCellPlain(qty) {
            if (qty <= 0) return '—';
            return \`<strong>\${qty.toLocaleString('en-IN')}</strong>\`;
        }
`;

html = html.replace(
    /function groupEntries[\s\S]*?window\.sendLotToReInward =/m,
    newJS + '\n\n        window.sendLotToReInward ='
);

fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', html);
console.log('firstrep rewritten successfully');
