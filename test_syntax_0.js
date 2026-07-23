
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
        let activeTab = 'standard';
        let entries = [];

        const tableBody = document.getElementById('entryTableBody');
        const tableWrap = document.getElementById('tableWrap');
        const emptyState = document.getElementById('emptyState');
        const entryCount = document.getElementById('entryCount');
        const searchInput = document.getElementById('searchInput');


        
        

        window.switchTab = function(tab) {
            activeTab = tab;
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.borderBottom = 'none';
                b.style.color = 'var(--steel)';
            });
            const activeBtn = document.getElementById('tab-' + tab);
            activeBtn.classList.add('active');
            activeBtn.style.borderBottom = '2px solid var(--blue)';
            activeBtn.style.color = 'var(--navy)';
            
            fetchEntries();
        };

        async function fetchEntries() {
            try {
                const url = '/api/rejected-iqc' + (activeTab === 'reinward' ? '?type=reinward' : '?type=standard');
                const res = await fetch(url);
                if (res.ok) {
                    entries = await res.json();
                    renderTable();
                    updateKPIs();
                }
            } catch (err) {
                console.error('Error fetching entries:', err);
                renderTable();
                updateKPIs();
            }
        }

        // Fetch dynamic count for sidebar badge "Inward from IQC"
        async function fetchInwardCount() {
            try {
                const res = await fetch('/api/inward');
                if (res.ok) {
                    const data = await res.json();
                    const badge = document.getElementById('iqcInwardBadge');
                    if (badge) {
                        badge.textContent = data.length;
                    }
                }
            } catch (err) {
                console.error('Error fetching iqc inward count:', err);
            }
        }

        
        async function fetchReInwardCount() {
            try {
                const res = await fetch('/api/reinwardro');
                if (res.ok) {
                    const data = await res.json();
                    const groups = {};
                    data.forEach(e => {
                        const d = e.date ? e.date.split('T')[0] : '';
                        const key = d + '|' + e.model;
                        groups[key] = true;
                    });
                    const count = Object.keys(groups).length;
                    const badge = document.getElementById('iqcReInwardBadge');
                    if (badge) {
                        badge.textContent = count;
                    }
                }
            } catch (err) {
                console.error('Error fetching iqc re-inward count:', err);
            }
        }


        function updateKPIs() {
            // KPI cards are not present on this page — safely skip if elements don't exist
            const grouped = groupEntries(entries);
            const totalQty = entries.reduce((s, e) => s + Number(e.totalQuantity || e.quantity || e.qty || 0), 0);
            const models = new Set(entries.map(e => e.model)).size;

            const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setEl('kpiTotal', grouped.length);
            setEl('kpiParts', entries.length);
            setEl('kpiModels', models);
            setEl('kpiQty', totalQty.toLocaleString('en-IN'));
            setEl('trendTotal', grouped.length > 0 ? '▼ Active' : '—');
            setEl('trendParts', entries.length + ' lines');
            setEl('trendModels', models + ' models');
            setEl('trendQty', totalQty > 0 ? '▼ Rejected' : '—');
        }

        
        async function updateField(id, field, value) {
            try {
                const body = {};
                body[field] = value;
                const res = await fetch('/api/rejected-iqc/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) throw new Error('Failed to update ' + field);
                const entry = entries.find(e => e._id === id);
                if (entry) entry[field] = value;
            } catch (err) {
                console.error(err);
                alert('Failed to update ' + field);
            }
        }

        async function markAsReplaced(id, event) {
            event.stopPropagation();
            if(!confirm('Mark this item as successfully replaced?')) return;
            try {
                const res = await fetch('/api/rejected-iqc/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isReplaced: true })
                });
                if (!res.ok) throw new Error('Failed to mark as replaced');
                
                // Remove from local array
                const index = entries.findIndex(e => e._id === id);
                if(index > -1) {
                    entries.splice(index, 1);
                    renderTable();
                    updateKPIs();
                }
            } catch(err) {
                console.error(err);
                alert('Failed to mark as replaced');
            }
        }


        async function fetchAcceptedproCount() {
            try {
                const res = await fetch('/api/rejectedpro');
                if (res.ok) {
                    const data = await res.json();
                    const groups = {};
                    data.forEach(e => {
                        const d = e.date ? e.date.split('T')[0] : '';
                        const key = d + '|' + e.model;
                        groups[key] = true;
                    });
                    const count = Object.keys(groups).length;
                    const badge = document.getElementById('iqcRejectedBadge');
                    if (badge) {
                        badge.textContent = count;
                    }
                }
            } catch (err) {
                console.error('Error fetching iqc rejected count:', err);
            }
        }

        function groupEntries(data) {
            const groups = {};
            data.forEach(e => {
                if (!e.itemDetails || e.itemDetails.length === 0) {
                    e.itemDetails = parseRemarksToItems(e.remarks, Number(e.quantity || e.qty || 0));
                }

                const d = e.date ? e.date.split('T')[0] : '';
                const key = (e.invoiceNo && e.invoiceNo !== '-') ? e.invoiceNo : (e.batchId ? e.batchId : (d + '|' + e.model));
                if (!groups[key]) {
                    groups[key] = { date: d, invoiceNo: e.invoiceNo || '-', model: e.model, parts: [], totalQty: 0, ids: [] };
                }
                groups[key].parts.push(e);
                groups[key].totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                groups[key].ids.push(e._id);
            });
            return Object.values(groups);
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

        const updateTimers = {};
        async function updateSubItemField(id, index, field, value) {
            const entry = entries.find(e => e._id === id);
            if (!entry || !entry.itemDetails || !entry.itemDetails[index]) return;
            entry.itemDetails[index][field] = value;
            
            const timerKey = id + '-' + index;
            clearTimeout(updateTimers[timerKey]);
            
            updateTimers[timerKey] = setTimeout(async () => {
                try {
                    await fetch('/api/rejected-iqc/' + id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemDetails: entry.itemDetails })
                    });
                } catch (err) {
                    console.error('Failed to auto-save:', err);
                }
            }, 600);
        }

        async function acceptSubItem(id, index, btn) {
            const entry = entries.find(e => e._id === id);
            if (!entry) return;
            entry.itemDetails[index].isReplaced = true;
            btn.style.background = 'gray';
            btn.textContent = 'Accepted';
            btn.disabled = true;
            
            // check if all items are replaced
            const allReplaced = entry.itemDetails.every(item => item.isReplaced);
            
            try {
                const body = { itemDetails: entry.itemDetails };
                if (allReplaced) {
                    body.isReplaced = true; // Mark the whole document as replaced
                }
                
                // Save the isReplaced flag — firstrep page picks up replaced items automatically
                await fetch('/api/rejected-iqc/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                if (allReplaced) {
                    entry.isReplaced = true;
                    // refresh table
                    setTimeout(renderTable, 500);
                }
            } catch (err) {
                console.error(err);
            }
        }

        function toggleSubItemRow(id) {
            const row = document.getElementById(id);
            if(row.style.display === 'none' || row.style.display === '') {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        }
    
        function renderTable() {
            const query = searchInput.value.trim().toLowerCase();
            const filtered = entries.filter(e => !e.isReplaced).filter(e => !e.isReplaced).filter(e =>
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
                    onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'"
                    onclick="toggleSubRow('subrow-${i}')">
                    <td>${i + 1}</td>
                    <td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>
                    <td><span class="cell-part">${g.invoiceNo}</span></td>
                    <td><span class="cell-part">${g.model}</span></td>
                    <td><strong>${g.parts.length}</strong> Parts</td>
                    <td>${g.totalQty.toLocaleString('en-IN')}</td>
                    <td style="text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--steel); user-select:none;">&#9660; Details</span>
                    </td>
                </tr>
                <tr id="subrow-${i}" style="display: none; background: #fafbfc;">
                    <td colspan="11" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 15px 30px;">
                            <table style="width:100%; border-collapse:collapse; font-size: 0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part No.</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Description</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Total Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--red); text-align:right; border-bottom:1px solid #e2e8f0;">Rejected Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Remarks</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Rep Serial No</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Addl Remarks</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${g.parts.map(p => `
                                        <tr onclick="toggleSubItemRow('subrow-items-${p._id}')" style="cursor:pointer; transition: background 0.15s;" onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='white'">
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9;"><strong>${p.partNo}</strong></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">${p.partDescription || '-'}</td>
                                            <td colspan="4" style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;">Total Qty: ${Number(p.quantity || p.qty || 0).toLocaleString('en-IN')}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;"><span style="font-size: 0.75rem; color: var(--steel);">&#9660; Items</span></td>
                                        </tr>
                                        <tr id="subrow-items-${p._id}" style="display: none; background: #fafbfc;">
                                            <td colspan="8" style="padding: 12px 24px;">
                                                <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                                    <thead>
                                                        <tr style="background: #f8fafc;">
                                                            <th style="padding: 8px; text-align: left; font-size: 0.75rem; color: var(--steel); border-bottom: 1px solid #e2e8f0;">Remarks (Nature)</th>
                                                            <th style="padding: 8px; text-align: left; font-size: 0.75rem; color: var(--steel); border-bottom: 1px solid #e2e8f0;">SN</th>
                                                            <th style="padding: 8px; text-align: left; font-size: 0.75rem; color: var(--steel); border-bottom: 1px solid #e2e8f0;">Spare</th>
                                                            <th style="padding: 8px; text-align: center; font-size: 0.75rem; color: var(--steel); border-bottom: 1px solid #e2e8f0;">Qty</th>
                                                            <th style="padding: 8px; text-align: left; font-size: 0.75rem; color: var(--steel); border-bottom: 1px solid #e2e8f0;">Rep Serial No</th>
                                                            <th style="padding: 8px; text-align: left; font-size: 0.75rem; color: var(--steel); border-bottom: 1px solid #e2e8f0;">Addl Remarks</th>
                                                            <th style="padding: 8px; text-align: center; font-size: 0.75rem; color: var(--steel); border-bottom: 1px solid #e2e8f0;">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${p.itemDetails.map((item, idx) => {
                                                            if (item.isReplaced) return '';
                                                            return `
                                                            <tr>
                                                                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem;">${item.nature || '-'}</td>
                                                                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem;">${item.serial || '-'}</td>
                                                                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem;">${item.spare || '-'}</td>
                                                                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; text-align: center;">${item.qty}</td>
                                                                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">
                                                                    <input type="text" value="${item.repSerialNo || ''}" oninput="updateSubItemField('${p._id}', ${idx}, 'repSerialNo', this.value)" style="width: 100%; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" placeholder="Rep Serial No" />
                                                                </td>
                                                                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">
                                                                    <input type="text" value="${item.additionalRemarks || ''}" oninput="updateSubItemField('${p._id}', ${idx}, 'additionalRemarks', this.value)" style="width: 100%; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" placeholder="Addl Remarks..." />
                                                                </td>
                                                                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                                                                    <button onclick="acceptSubItem('${p._id}', ${idx}, this)" style="background: var(--green); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">&#10004; </button>
                                                                </td>
                                                            </tr>
                                                            `;
                                                        }).join('')}
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
            const rows = [['Sl.No.', 'Date', 'Invoice No.', 'Model', 'Part No.', 'Description', 'Quantity', 'Status', 'Remarks', 'Rep Serial No', 'Additional Remarks']];
            let sl = 1;
            groupEntries(entries).forEach(g => {
                g.parts.forEach(p => {
                    rows.push([sl++, g.date, g.invoiceNo, g.model, p.partNo, p.partDescription || '', Number(p.quantity || p.qty || 0), 'Rejected', p.remarks || '', p.repSerialNo || '', p.additionalRemarks || '']);
                });
            });
            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'rejected_iqc_' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        });

        /* ── Init ── */
        fetchEntries();
    