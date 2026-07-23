
        const document = {
            getElementById: (id) => ({ style: {}, classList: { add:()=>{}, remove:()=>{}, toggle:()=>{} }, innerHTML: '', addEventListener: ()=>{} })
        };
        const window = { location: { href: '' } };
        const searchInput = document.getElementById('search'); searchInput.value = '';
        const emptyState = document.getElementById('empty');
        const tableWrap = document.getElementById('wrap');
        const tableBody = document.getElementById('body');
        const entryCount = document.getElementById('count');
        
        // Expose to global so the script can access them
        global.document = document;
        global.window = window;
        global.searchInput = searchInput;
        global.emptyState = emptyState;
        global.tableWrap = tableWrap;
        global.tableBody = tableBody;
        global.entryCount = entryCount;
        
        
        /* ── Sidebar toggle ── */
        const sidebar = document.getElementById('sidebar');
        const scrim = document.getElementById('scrim');
        const menuToggle = document.getElementById('menuToggle');

        function openSidebar() { sidebar.classList.add('open'); scrim.classList.add('show'); }
        function closeSidebar() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }
        menuToggle.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
        scrim.addEventListener('click', closeSidebar);

        /* ── Helpers ── */
        function formatDateDisplay(isoDate) {
            if (!isoDate) return '—';
            const d = isoDate.split('T')[0];
            const [y, m, day] = d.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${day} ${months[parseInt(m, 10) - 1]} ${y}`;
        }

        /* ── State ── */
        let entries = [];
        const tableBody = document.getElementById('entryTableBody');
        const tableWrap = document.getElementById('tableWrap');
        const emptyState = document.getElementById('emptyState');
        const entryCount = document.getElementById('entryCount');
        const searchInput = document.getElementById('searchInput');

        async function fetchEntries() {
            try {
                const res = await fetch('/api/rejectedpro');
                if (res.ok) {
                    const allData = await res.json();
                    entries = allData.filter(e => e.source === 'inwardp');
                    renderTable();
                    updateKPIs();
                    // Set the rejected badge on the active page itself
                    const badge = document.getElementById('productionRejectedBadge');
                    if (badge) {
                        badge.textContent = groupEntries(entries).length;
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
function groupEntries(data) {
            const groups = {};
            data.forEach(e => {
                if (!e.itemDetails || e.itemDetails.length === 0) {
                    e.itemDetails = parseRemarksToItems(e.remarks, Number(e.quantity || e.qty || 0));
                }

                const d = e.date ? e.date.split('T')[0] : '';
                const inv = e.invoiceNo || '-';
                const key = inv + '|' + e.model;
                if (!groups[key]) {
                    groups[key] = { date: d, invoiceNo: inv, model: e.model, parts: [], totalQty: 0, rejections: [] };
                }
                groups[key].parts.push(e);
                groups[key].totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                groups[key].rejections.push({
                    id: e._id,
                    sentToReInward: e.sentToReInward || false,
                    reInwarded: e.reInwarded || false
                });
            });
            return Object.values(groups);
        }

        function updateKPIs() {
            const grouped = groupEntries(entries);
            const totalQty = entries.reduce((s, e) => s + Number(e.totalQuantity || e.quantity || e.qty || 0), 0);
            const models = new Set(entries.map(e => e.model)).size;

            document.getElementById('kpiTotal').textContent = grouped.length;
            document.getElementById('kpiParts').textContent = entries.length;
            document.getElementById('kpiModels').textContent = models;
            document.getElementById('kpiQty').textContent = totalQty.toLocaleString('en-IN');

            document.getElementById('trendTotal').textContent = grouped.length > 0 ? '▼ ' + grouped.length + ' lots' : '—';
            document.getElementById('trendParts').textContent = entries.length + ' lines';
            document.getElementById('trendModels').textContent = models + ' models';
            document.getElementById('trendQty').textContent = totalQty > 0 ? '▼ Rejected' : '—';
        }

        
        function parseRemarksToItems(remarks, totalQty) {
            const items = [];
            if (remarks) {
                const parts = remarks.split(', ');
                parts.forEach(p => {
                    let nature = p;
                    let qty = 1;
                    const splitIdx = p.lastIndexOf(': ');
                    if (splitIdx !== -1 && !isNaN(p.substring(splitIdx + 2).trim())) {
                        qty = parseInt(p.substring(splitIdx + 2).trim(), 10) || 1;
                        nature = p.substring(0, splitIdx);
                    }
                    let serial = '';
                    let spare = '';
                    const spareMatch = nature.match(/\(Spare: (.*?)\)$/);
                    if (spareMatch) {
                        spare = spareMatch[1];
                        nature = nature.substring(0, spareMatch.index).trim();
                    }
                    const snMatch = nature.match(/\(SN: (.*?)\)$/);
                    if (snMatch) {
                        serial = snMatch[1];
                        nature = nature.substring(0, snMatch.index).trim();
                    }
                    
                    for (let i = 0; i < qty; i++) {
                        items.push({
                            nature: nature,
                            serial: serial,
                            spare: spare,
                            qty: 1,
                            repSerialNo: '',
                            additionalRemarks: '',
                            isReplaced: false
                        });
                    }
                });
            }
            
            const remaining = (parseInt(totalQty, 10) || 0) - items.length;
            for(let i = 0; i < remaining; i++) {
                items.push({
                    nature: '',
                    serial: '',
                    spare: '',
                    qty: 1,
                    repSerialNo: '',
                    additionalRemarks: '',
                    isReplaced: false
                });
            }
            
            return items;
        }

        async function updateSubItemField(id, index, field, value) {
            let entry;
            entries.forEach(e => {
                if(e.rejections) {
                    const found = e.rejections.find(r => r._id === id);
                    if (found) entry = found;
                }
                if (e._id === id) entry = e;
            });
            if (!entry) return;
            entry.itemDetails[index][field] = value;
            try {
                await fetch('/api/rejectedpro/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemDetails: entry.itemDetails })
                });
            } catch (err) {
                console.error(err);
            }
        }

        async function acceptSubItem(id, index, btn) {
            let entry;
            entries.forEach(e => {
                if(e.rejections) {
                    const found = e.rejections.find(r => r._id === id);
                    if (found) entry = found;
                }
                if (e._id === id) entry = e;
            });
            if (!entry) return;
            entry.itemDetails[index].isReplaced = true;
            btn.style.background = 'gray';
            btn.textContent = 'Accepted';
            btn.disabled = true;
            
            const allReplaced = entry.itemDetails.every(item => item.isReplaced);
            
            try {
                const body = { itemDetails: entry.itemDetails };
                if (allReplaced) {
                    body.isReplaced = true; 
                }
                
                await fetch('/api/rejectedpro/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                // Reduce yetToAcceptQty on the corresponding acceptedpro entry
                const itemQty = Number(entry.itemDetails[index].qty || 1);
                await fetch('/api/acceptedpro/reduce-yet-to-accept', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        batchId: entry.batchId,
                        partNo: entry.partNo,
                        reduceBy: itemQty,
                        source: 'PRO'
                    })
                });
                
                if (allReplaced) {
                    entry.isReplaced = true;
                    setTimeout(renderTable, 500);
                }
            } catch (err) {
                console.error(err);
            }
        }

        function toggleSubItemRow(id) {
            const row = document.getElementById(id);
            if(row && (row.style.display === 'none' || row.style.display === '')) {
                row.style.display = 'table-row';
            } else if (row) {
                row.style.display = 'none';
            }
        }
    
        function renderTable() {
            const query = searchInput.value.trim().toLowerCase();
            const filtered = entries.filter(e =>
                !query ||
                (e.model && e.model.toLowerCase().includes(query)) ||
                (e.partNo && e.partNo.toLowerCase().includes(query)) ||
                (e.partDescription && e.partDescription.toLowerCase().includes(query))
            );

            const grouped = groupEntries(filtered);
            entryCount.textContent = grouped.length;

            if (grouped.length === 0) {
                tableWrap.style.display = 'none';
                emptyState.style.display = 'flex';
                return;
            }
            tableWrap.style.display = 'block';
            emptyState.style.display = 'none';

            let html = '';
            grouped.forEach((g, i) => {
                html += `
                <tr class="group-row" style="cursor:pointer; transition: background 0.15s;"
                    onmouseover="this.style.background='#fff8f8'" onmouseout="this.style.background='white'"
                    onclick="toggleSubRow('subrow-${i}')">
                    <td>${i + 1}</td>
                    <td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>
                    <td><span class="cell-part" style="font-weight: 500;">${g.invoiceNo || '-'}</span></td>
                    <td><span class="cell-part">${g.model}</span></td>
                    <td><strong>${g.parts.length}</strong> Parts</td>
                    <td>${g.totalQty.toLocaleString('en-IN')}</td>
                    <td>${renderStatusCell(g)}</td>
                    <td style="text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--steel); user-select:none;">&#9660; Details</span>
                    </td>
                </tr>
                <tr id="subrow-${i}" style="display: none; background: #fff9f9;">
                    <td colspan="9" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 15px 30px;">
                            <table style="width:100%; border-collapse:collapse; font-size: 0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part No.</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Description</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Total Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--red); text-align:right; border-bottom:1px solid #e2e8f0;">Rejected Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0;">Status</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.values(g.mergedParts).map((m, mIdx) => `
                                        <tr onclick="toggleSubItemRow('subrow-items-${i}-${mIdx}')" style="cursor:pointer; transition: background 0.15s;" onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='white'">
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9;"><strong>${m.partNo}</strong></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">${m.partDescription || '-'}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;">${Number(m.totalQty).toLocaleString('en-IN')}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right; color:var(--red);">${Number(m.qty).toLocaleString('en-IN')}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;"><span class="status-pill rejected">Rejected</span></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;"><span style="font-size: 0.75rem; color: var(--steel);">&#9660; Items</span></td>
                                        </tr>
                                        <tr id="subrow-items-${i}-${mIdx}" style="display: none; background: #fafbfc;">
                                            <td colspan="9" style="padding: 12px 24px;">
                                                <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                                    <thead>
                                                        <tr>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">SN / Batch</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">Nature of Problem</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">Spare Replaced</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:center; font-size:0.75rem; text-transform:uppercase;">Qty</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:center; font-size:0.75rem; text-transform:uppercase;">Status</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:center; font-size:0.75rem; text-transform:uppercase;">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${m.items.length > 0 ? m.items.map((sub) => {
                                                            let bg = sub.isReplaced ? '#f0fdf4' : 'white';
                                                            let rowHtml = `<tr style="background: ${bg}; border-bottom: 1px solid #f1f5f9;">
                                                                <td style="padding:6px 12px; font-size:0.75rem;">${sub.serial || '-'}</td>
                                                                <td style="padding:6px 12px; font-size:0.75rem;">${sub.nature || '-'}</td>
                                                                <td style="padding:6px 12px; font-size:0.75rem;">${sub.spare || '-'}</td>
                                                                <td style="padding:6px 12px; text-align:center; font-size:0.75rem;">${sub.qty || 1}</td>
                                                                <td style="padding:6px 12px; text-align:center;">`;
                                                            if (sub.isReplaced) {
                                                                rowHtml += `<span style="color:var(--green); font-size:0.7rem; font-weight:700;">Accepted</span>`;
                                                            } else if (sub._parentReInwarded || sub._parentSentToReInward) {
                                                                rowHtml += `<span style="color:#d97706; font-size:0.7rem; font-weight:700;">Sent to IP</span>`;
                                                            } else {
                                                                rowHtml += `<span style="color:var(--red); font-size:0.7rem; font-weight:700;">Rejected</span>`;
                                                            }
                                                            rowHtml += `</td><td style="padding:6px 12px; text-align:center;">`;
                                                            
                                                            if (!sub.isReplaced && !sub._parentReInwarded && !sub._parentSentToReInward) {
                                                                rowHtml += `<button onclick="acceptSubItem('${sub._originalId}', ${sub._originalIdx}, this)" style="background: var(--green); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">&#10004; </button>`;
                                                            } else {
                                                                rowHtml += `-`;
                                                            }
                                                            
                                                            rowHtml += `</td></tr>`;
                                                            return rowHtml;
                                                        }).join('') : `<tr><td colspan="6" style="padding:6px 12px; text-align:center; color:var(--steel); font-size:0.75rem;">No item details recorded.</td></tr>`}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                `;
            });
            tableBody.innerHTML = html;
        }

        window.toggleSubRow = function (id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        };

        searchInput.addEventListener('input', renderTable);

        /* ── Export ── */
        document.getElementById('exportBtn').addEventListener('click', () => {
            const rows = [['Sl.No.', 'Date', 'Model', 'Part No.', 'Description', 'Quantity', 'Status']];
            let sl = 1;
            groupEntries(entries).forEach(g => {
                g.parts.forEach(p => {
                    rows.push([sl++, g.date, g.model, p.partNo, p.partDescription || '', Number(p.quantity || p.qty || 0), 'Rejected']);
                });
            });
            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'rejected_production_' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        });

        function renderStatusCell(g) {
            let html = `<span class="status-pill rejected">Rejected</span>`;
            if (g.rejections && g.rejections.length > 0) {
                const allReinspected = g.rejections.every(r => r.reInwarded);
                const allSent = g.rejections.every(r => r.sentToReInward || r.reInwarded);
                
                if (allReinspected) {
                    html += ` <span style="font-size:0.68rem;color:var(--green);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(30,123,77,0.1);border-radius:4px;">[Re-inspected]</span>`;
                } else if (allSent) {
                    html += ` <span style="font-size:0.68rem;color:var(--amber);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(199,123,18,0.1);border-radius:4px;">[In Re-Inward]</span>`;
                }
            }
            return html;
        }

        async function fetchReInwardCount() {
            try {
                const res = await fetch('/api/reinwardpro');
                if (res.ok) {
                    const data = await res.json();
                    const groups = {};
                    data.forEach(e => {
                        const d = e.date ? e.date.split('T')[0] : '';
                        const key = d + '|' + e.model;
                        groups[key] = true;
                    });
                    const badge = document.getElementById('productionReInwardBadge');
                    if (badge) {
                        badge.textContent = Object.keys(groups).length;
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }

        /* ── Init ── */
        
        
        
    
        
        // Manually run
        entries = [{"_id":"6a5f47be9fcbb63368be2bbb","date":"2026-07-21T10:19:41.960Z","model":"TEST-1","partNo":"TEST-PART-1","partDescription":"TEST","quantity":10,"totalQuantity":100,"remarks":"","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"source":"inwardp","createdAt":"2026-07-21T10:19:42.068Z","updatedAt":"2026-07-21T10:19:42.068Z","__v":0},{"_id":"6a5f4c83b2b7e82d5071c6c1","date":"2026-07-21T00:00:00.000Z","model":"TS-III Nellcor","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":3,"totalQuantity":100,"batchId":"1784630403624","invoiceNo":"in-2354","remarks":"Surface Defect (SN: 2586): 1, Tool Mark (SN: 2177): 1, Material Quality (SN: 2399): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"source":"inwardp","createdAt":"2026-07-21T10:40:03.833Z","updatedAt":"2026-07-21T10:40:03.833Z","__v":0},{"_id":"6a5f4c83b2b7e82d5071c6be","date":"2026-07-21T00:00:00.000Z","model":"TS-III Nellcor","partNo":"60.000844A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,Nellcor)","quantity":1,"totalQuantity":100,"batchId":"1784630403624","invoiceNo":"in-2354","remarks":"Dimension Issue (SN: 8425): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"source":"inwardp","createdAt":"2026-07-21T10:40:03.811Z","updatedAt":"2026-07-21T10:40:03.811Z","__v":0},{"_id":"6a5f4c83b2b7e82d5071c6b5","date":"2026-07-21T00:00:00.000Z","model":"TS-III Nellcor","partNo":"15-100-0121","partDescription":"Paediatric Cuff with connector M5123(18-26cm)","quantity":2,"totalQuantity":100,"batchId":"1784630403624","invoiceNo":"in-2354","remarks":"Surface Defect (SN: 8745): 1, Surface Defect (SN: 88565): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"source":"inwardp","createdAt":"2026-07-21T10:40:03.716Z","updatedAt":"2026-07-21T10:40:03.716Z","__v":0},{"_id":"6a5f31fb3b73917bd856daed","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":4,"totalQuantity":300,"batchId":"1784623610083","remarks":"Dimension Issue (SN: 4367): 1, Material Quality (SN: 7967): 1, Material Quality (SN: 797): 1, Tool Mark (SN: 46767): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[{"nature":"Dimension Issue","serial":"4367","spare":"","qty":1,"repSerialNo":"77854","additionalRemarks":"","isReplaced":true},{"nature":"Material Quality","serial":"7967","spare":"","qty":1,"repSerialNo":"845","additionalRemarks":"","isReplaced":true},{"nature":"Material Quality","serial":"797","spare":"","qty":1,"repSerialNo":"","additionalRemarks":"","isReplaced":false},{"nature":"Tool Mark","serial":"46767","spare":"","qty":1,"repSerialNo":"","additionalRemarks":"","isReplaced":false}],"createdAt":"2026-07-21T08:46:51.376Z","updatedAt":"2026-07-21T10:25:51.793Z","__v":0,"source":"inwardp"},{"_id":"6a5f31fb3b73917bd856dae8","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":300,"batchId":"1784623610083","remarks":"Surface Defect (SN: 8977): 1, Tool Mark (SN: 57575): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:51.186Z","updatedAt":"2026-07-21T10:25:51.849Z","__v":0,"source":"inwardp"},{"_id":"6a5f31fa3b73917bd856dadf","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":4,"totalQuantity":300,"batchId":"1784623610083","remarks":"Dimension Issue (SN: 582): 1, Surface Defect (SN: 235114): 1, Surface Defect (SN: 561): 1, Material Quality (SN: 458): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:50.823Z","updatedAt":"2026-07-21T10:25:51.894Z","__v":0,"source":"inwardp"},{"_id":"6a5f31fa3b73917bd856dadc","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":1,"totalQuantity":300,"batchId":"1784623610083","remarks":"Dimension Issue (SN: 7679): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:50.715Z","updatedAt":"2026-07-21T10:25:51.943Z","__v":0,"source":"inwardp"},{"_id":"6a5f31fa3b73917bd856dad7","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":3,"totalQuantity":300,"batchId":"1784623610083","remarks":"Dimension Issue (SN: 875255): 1, Surface Defect (SN: 25413): 1, Tool Mark (SN: 4522): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:50.620Z","updatedAt":"2026-07-21T10:25:51.991Z","__v":0,"source":"inwardp"},{"_id":"6a5f31fa3b73917bd856dad4","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":5,"totalQuantity":300,"batchId":"1784623610083","remarks":"Dimension Issue (SN: 6368): 1, Surface Defect (SN: 9444): 1, Dimension Issue (SN: 6868): 1, Material Quality (SN: 78877): 1, Tool Mark (SN: 777647): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:50.528Z","updatedAt":"2026-07-21T10:25:52.043Z","__v":0,"source":"inwardp"},{"_id":"6a5f31fa3b73917bd856dacf","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":1,"totalQuantity":300,"batchId":"1784623610083","remarks":"Surface Defect (SN: 252424): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:50.399Z","updatedAt":"2026-07-21T10:25:52.086Z","__v":0,"source":"inwardp"},{"_id":"6a5f31e53b73917bd856dac4","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":5,"totalQuantity":300,"batchId":"1784623588436","remarks":"Dimension Issue (SN: 6368): 1, Surface Defect (SN: 9444): 1, Dimension Issue (SN: 6868): 1, Material Quality (SN: 78877): 1, Tool Mark (SN: 777647): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:29.143Z","updatedAt":"2026-07-21T10:25:52.129Z","__v":0,"source":"inwardp"},{"_id":"6a5f31e43b73917bd856dabf","date":"2026-07-21T00:00:00.000Z","model":"TS-III Masimo","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":1,"totalQuantity":300,"batchId":"1784623588436","remarks":"Surface Defect (SN: 252424): 1","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"createdAt":"2026-07-21T08:46:28.897Z","updatedAt":"2026-07-21T10:25:52.176Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2525984a3face639a8a2","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620256113","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:52:05.138Z","updatedAt":"2026-07-21T10:25:52.226Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2525984a3face639a8a0","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620255705","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:52:05.136Z","updatedAt":"2026-07-21T10:25:52.275Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2525984a3face639a89e","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620255346","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:52:05.134Z","updatedAt":"2026-07-21T10:25:52.325Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2525984a3face639a897","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620255168","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:52:05.110Z","updatedAt":"2026-07-21T10:25:52.365Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2522984a3face639a88c","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620255168","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:52:02.415Z","updatedAt":"2026-07-21T10:25:52.409Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f251d984a3face639a881","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620255168","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:57.049Z","updatedAt":"2026-07-21T10:25:52.457Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f251b984a3face639a87e","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620255168","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:55.759Z","updatedAt":"2026-07-21T10:25:52.508Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f251a984a3face639a875","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000859A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,analog spo2)","quantity":2,"totalQuantity":200,"batchId":"1784620254994","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:54.433Z","updatedAt":"2026-07-21T10:25:52.559Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2519984a3face639a86c","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000857A","partDescription":"Analog Upgradable BM100A Module","quantity":1,"totalQuantity":200,"batchId":"1784620254994","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:53.790Z","updatedAt":"2026-07-21T10:25:52.607Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2518984a3face639a863","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620254994","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:52.999Z","updatedAt":"2026-07-21T10:25:52.658Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2517984a3face639a858","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620254994","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:51.259Z","updatedAt":"2026-07-21T10:25:52.708Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2513984a3face639a84d","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620254994","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:47.227Z","updatedAt":"2026-07-21T10:25:52.758Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2513984a3face639a84a","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620254994","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:47.043Z","updatedAt":"2026-07-21T10:25:52.808Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f250e984a3face639a841","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000859A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,analog spo2)","quantity":2,"totalQuantity":200,"batchId":"1784620254816","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:42.944Z","updatedAt":"2026-07-21T10:25:52.859Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f250b984a3face639a838","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000857A","partDescription":"Analog Upgradable BM100A Module","quantity":1,"totalQuantity":200,"batchId":"1784620254816","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:39.714Z","updatedAt":"2026-07-21T10:25:52.902Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2509984a3face639a82f","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620254816","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:37.311Z","updatedAt":"2026-07-21T10:25:52.957Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2505984a3face639a824","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620254816","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:33.783Z","updatedAt":"2026-07-21T10:25:53.010Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2502984a3face639a819","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620254816","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:30.305Z","updatedAt":"2026-07-21T10:25:53.076Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f2501984a3face639a816","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620254816","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:29.419Z","updatedAt":"2026-07-21T10:25:53.124Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24ff984a3face639a80d","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000859A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,analog spo2)","quantity":2,"totalQuantity":200,"batchId":"1784620254641","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:27.695Z","updatedAt":"2026-07-21T10:25:53.174Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24fc984a3face639a804","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000857A","partDescription":"Analog Upgradable BM100A Module","quantity":1,"totalQuantity":200,"batchId":"1784620254641","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:24.673Z","updatedAt":"2026-07-21T10:25:53.225Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24f9984a3face639a7fb","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620254641","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:21.394Z","updatedAt":"2026-07-21T10:25:53.271Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24f6984a3face639a7f0","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620254641","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:18.455Z","updatedAt":"2026-07-21T10:25:53.313Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24f2984a3face639a7e5","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620254641","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:14.678Z","updatedAt":"2026-07-21T10:25:53.358Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24f1984a3face639a7e2","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620254641","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:13.393Z","updatedAt":"2026-07-21T10:25:53.400Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24ef984a3face639a7d9","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000859A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,analog spo2)","quantity":2,"totalQuantity":200,"batchId":"1784620254441","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:11.160Z","updatedAt":"2026-07-21T10:25:53.442Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24eb984a3face639a7d0","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000857A","partDescription":"Analog Upgradable BM100A Module","quantity":1,"totalQuantity":200,"batchId":"1784620254441","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:07.910Z","updatedAt":"2026-07-21T10:25:53.492Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e7984a3face639a7c7","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620254441","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:03.825Z","updatedAt":"2026-07-21T10:25:53.542Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e4984a3face639a7bc","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620254441","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:51:00.123Z","updatedAt":"2026-07-21T10:25:53.591Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e3984a3face639a7b1","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620254441","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:59.636Z","updatedAt":"2026-07-21T10:25:53.630Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e3984a3face639a7ae","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620254441","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:59.625Z","updatedAt":"2026-07-21T10:25:53.675Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e3984a3face639a7a5","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000859A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,analog spo2)","quantity":2,"totalQuantity":200,"batchId":"1784620247664","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:59.079Z","updatedAt":"2026-07-21T10:25:53.721Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e2984a3face639a79c","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000857A","partDescription":"Analog Upgradable BM100A Module","quantity":1,"totalQuantity":200,"batchId":"1784620247664","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:58.808Z","updatedAt":"2026-07-21T10:25:53.773Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e2984a3face639a793","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620247664","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:58.528Z","updatedAt":"2026-07-21T10:25:53.814Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e2984a3face639a788","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620247664","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:58.303Z","updatedAt":"2026-07-21T10:25:53.851Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e1984a3face639a77d","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620247664","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:57.996Z","updatedAt":"2026-07-21T10:25:53.907Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e1984a3face639a77a","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620247664","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:57.939Z","updatedAt":"2026-07-21T10:25:53.952Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e1984a3face639a771","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000859A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,analog spo2)","quantity":2,"totalQuantity":200,"batchId":"1784620246553","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:57.394Z","updatedAt":"2026-07-21T10:25:54.008Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24e1984a3face639a768","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000857A","partDescription":"Analog Upgradable BM100A Module","quantity":1,"totalQuantity":200,"batchId":"1784620246553","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:57.092Z","updatedAt":"2026-07-21T10:25:54.059Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24df984a3face639a75f","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620246553","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:55.620Z","updatedAt":"2026-07-21T10:25:54.104Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24db984a3face639a754","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620246553","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:51.816Z","updatedAt":"2026-07-21T10:25:54.150Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d8984a3face639a749","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620246553","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:48.683Z","updatedAt":"2026-07-21T10:25:54.195Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d7984a3face639a746","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620246553","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:47.919Z","updatedAt":"2026-07-21T10:25:54.243Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d6984a3face639a73d","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000859A","partDescription":"Side Plate Assembly(2-IBP; 2-TEMP,analog spo2)","quantity":2,"totalQuantity":200,"batchId":"1784620238129","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:46.509Z","updatedAt":"2026-07-21T10:25:54.288Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d5984a3face639a734","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000857A","partDescription":"Analog Upgradable BM100A Module","quantity":1,"totalQuantity":200,"batchId":"1784620238129","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:45.301Z","updatedAt":"2026-07-21T10:25:54.334Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d4984a3face639a72b","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"60.000854A","partDescription":"Back cabinet(cabinet assembly)-TS III","quantity":2,"totalQuantity":195,"batchId":"1784620238129","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:44.515Z","updatedAt":"2026-07-21T10:25:54.380Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d3984a3face639a720","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"175.000100A","partDescription":"Acrylic sheet","quantity":2,"totalQuantity":200,"batchId":"1784620238129","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:43.807Z","updatedAt":"2026-07-21T10:25:54.426Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d1984a3face639a715","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0027","partDescription":"Skin temp probe","quantity":2,"totalQuantity":192,"batchId":"1784620238129","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:41.572Z","updatedAt":"2026-07-21T10:25:54.473Z","__v":0,"source":"inwardp"},{"remarks":"","repSerialNo":"","additionalRemarks":"","isReplaced":false,"itemDetails":[],"_id":"6a5f24d0984a3face639a712","date":"2026-07-21T00:00:00.000Z","model":"TS-III Analog Upgradable","partNo":"15-100-0026","partDescription":"Tubing with connector for reusable cuff","quantity":4,"totalQuantity":194,"batchId":"1784620238129","status":"Rejected","reInwarded":false,"sentToReInward":false,"problemStage":"","createdAt":"2026-07-21T07:50:40.292Z","updatedAt":"2026-07-21T10:25:54.519Z","__v":0,"source":"inwardp"}];
        try {
            renderTable();
            console.log('RenderTable finished without throwing.');
            console.log('HTML length: ' + tableBody.innerHTML.length);
        } catch(e) {
            console.error('RenderTable threw error:', e);
        }
    