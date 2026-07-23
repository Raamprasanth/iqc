
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
                        nature = p.substring(0, splitIdx).trim();
                    }
                    items.push({ nature: nature, qty: qty });
                });
            } else if (totalQty > 0) {
                items.push({ nature: '-', qty: totalQty });
            }
            return items;
        }

        function groupEntries(data) {
            const groups = {};
            data.forEach(e => {
                if (!e.itemDetails || e.itemDetails.length === 0) {
                    e.itemDetails = parseRemarksToItems(e.remarks, Number(e.quantity || e.qty || 0));
                }

                // Check if the whole entry is already replaced or sent to re-inward
                if (e.reInwarded || e.sentToReInward || e.isReplaced) return;

                const d = e.date ? e.date.split('T')[0] : '';
                const inv = e.invoiceNo || '-';
                const key = inv + '|' + e.model;
                if (!groups[key]) {
                    groups[key] = { date: d, invoiceNo: inv, model: e.model, parts: [], totalQty: 0, rejections: [], mergedParts: {} };
                }

                let activeQty = 0;
                const activeSubItems = [];
                if (e.itemDetails) {
                    e.itemDetails.forEach((sub, idx) => {
                        if (!sub.isReplaced) {
                            activeQty += Number(sub.qty || 1);
                            activeSubItems.push({
                                ...sub,
                                _originalId: e._id,
                                _originalIdx: idx
                            });
                        }
                    });
                }

                // If no active rejected items left in this entry, skip it
                if (activeQty === 0 && activeSubItems.length === 0) return;

                groups[key].parts.push(e);
                groups[key].totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                groups[key].rejections.push(e);

                // Aggregate by partNo
                const pKey = e.partNo;
                if (!groups[key].mergedParts[pKey]) {
                    groups[key].mergedParts[pKey] = {
                        partNo: e.partNo,
                        partDescription: e.partDescription,
                        totalQty: 0,
                        qty: 0,
                        items: []
                    };
                }
                const m = groups[key].mergedParts[pKey];
                m.totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                m.qty += activeQty;
                
                m.items.push(...activeSubItems);
            });
            
            // Filter out groups with 0 parts
            const finalGroups = Object.values(groups).filter(g => g.parts.length > 0);
            return finalGroups;
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
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">Remarks (Nature)</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">SN / Batch</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">Spare Replaced</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:center; font-size:0.75rem; text-transform:uppercase;">Qty</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">Rep Serial No</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:left; font-size:0.75rem; text-transform:uppercase;">Addl Remarks</th>
                                                            <th style="padding:6px 12px; font-weight:600; color:var(--navy); background:#f1f5f9; text-align:center; font-size:0.75rem; text-transform:uppercase;">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${m.items.length > 0 ? m.items.map((sub) => {
                                                            let rowHtml = `<tr style="background: white; border-bottom: 1px solid #f1f5f9;">
                                                                <td style="padding:6px 12px; font-size:0.75rem;">${sub.nature || '-'}</td>
                                                                <td style="padding:6px 12px; font-size:0.75rem;">${sub.serial || '-'}</td>
                                                                <td style="padding:6px 12px; font-size:0.75rem;">${sub.spare || '-'}</td>
                                                                <td style="padding:6px 12px; text-align:center; font-size:0.75rem;">${sub.qty || 1}</td>
                                                                <td style="padding: 6px 12px;">
                                                                    <input type="text" value="${sub.repSerialNo || ''}" oninput="updateSubItemField('${sub._originalId}', ${sub._originalIdx}, 'repSerialNo', this.value)" style="width: 100%; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" placeholder="Rep Serial No" />
                                                                </td>
                                                                <td style="padding: 6px 12px;">
                                                                    <input type="text" value="${sub.additionalRemarks || ''}" oninput="updateSubItemField('${sub._originalId}', ${sub._originalIdx}, 'additionalRemarks', this.value)" style="width: 100%; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" placeholder="Addl Remarks..." />
                                                                </td>
                                                                <td style="padding:6px 12px; text-align:center;">
                                                                    <button onclick="acceptSubItem('${sub._originalId}', ${sub._originalIdx}, this)" style="background: var(--green); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">&#10004;</button>
                                                                </td>
                                                            </tr>`;
                                                            return rowHtml;
                                                        }).join('') : `<tr><td colspan="7" style="padding:6px 12px; text-align:center; color:var(--steel); font-size:0.75rem;">No items pending replacement.</td></tr>`}
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

        const updateTimers = {};
        async function updateSubItemField(id, index, field, value) {
            const entry = entries.find(e => e._id === id);
            if (!entry || !entry.itemDetails || !entry.itemDetails[index]) return;
            entry.itemDetails[index][field] = value;
            
            const timerKey = id + '-' + index;
            clearTimeout(updateTimers[timerKey]);
            
            updateTimers[timerKey] = setTimeout(async () => {
                try {
                    await fetch('/api/rejectedpro/' + id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemDetails: entry.itemDetails })
                    });
                } catch (err) {
                    console.error('Failed to auto-save:', err);
                }
            }, 600);
        }
        }

        async function acceptSubItem(id, index, btn) {
            const entry = entries.find(e => e._id === id);
            if (!entry) return;
            const sub = entry.itemDetails[index];
            sub.isReplaced = true;
            btn.style.background = 'gray';
            btn.textContent = 'Accepted';
            btn.disabled = true;
            
            // Check if all items are replaced now
            const allReplaced = entry.itemDetails.every(item => item.isReplaced);
            
            // Log history for acceptedpro pop-up
            if (!entry.yetToAcceptHistory) {
                entry.yetToAcceptHistory = [];
            }
            entry.yetToAcceptHistory.push({
                reducedBy: sub.qty || 1,
                updatedAt: new Date().toISOString()
            });
            entry.updatedAt = new Date().toISOString();
            
            try {
                const body = { 
                    itemDetails: entry.itemDetails,
                    yetToAcceptHistory: entry.yetToAcceptHistory,
                    updatedAt: entry.updatedAt
                };
                if (allReplaced) {
                    body.isReplaced = true;
                }
                
                await fetch('/api/rejectedpro/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                if (allReplaced) {
                    entry.isReplaced = true;
                }
                
                // Immediately refresh table so the ticked item disappears
                renderTable();
            } catch (err) {
                console.error(err);
                alert('Error updating item. Please check network.');
            }
        }

        window.toggleSubRow = function (id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        };
        
        window.toggleSubItemRow = function (id) {
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
        fetchEntries();
        fetchInwardpCount();
        fetchReInwardCount();
    