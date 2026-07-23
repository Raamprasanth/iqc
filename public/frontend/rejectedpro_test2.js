
        /* ── Sidebar toggle ── */
        const sidebar = {};
        const scrim = {};
        const menuToggle = {};

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
        const tableBody = {};
        const tableWrap = {};
        const emptyState = {};
        const entryCount = {};
        const searchInput = {};

        async function fetchEntries() {
            try {
                const res = await fetch('/api/rejectedpro');
                if (res.ok) {
                    const allData = await res.json();
                    entries = allData.filter(e => e.source === 'inwardp');
                    renderTable();
                    updateKPIs();
                    // Set the rejected badge on the active page itself
                    const badge = {};
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

            {}.textContent = grouped.length;
            {}.textContent = entries.length;
            {}.textContent = models;
            {}.textContent = totalQty.toLocaleString('en-IN');

            {}.textContent = grouped.length > 0 ? '▼ ' + grouped.length + ' lots' : '—';
            {}.textContent = entries.length + ' lines';
            {}.textContent = models + ' models';
            {}.textContent = totalQty > 0 ? '▼ Rejected' : '—';
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
            const row = {};
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
            const el = {};
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        };

        searchInput.addEventListener('input', renderTable);

        /* ── Export ── */
        {}.addEventListener('click', () => {
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
                    const badge = {};
                    if (badge) {
                        badge.textContent = Object.keys(groups).length;
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }

        /* ── Init ── */
        fetchEntries();
        fetchInwardpCount();
        fetchReInwardCount();
    