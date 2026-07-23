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
                                                                    <input type="text" value="${sub.repSerialNo || ''}" onchange="updateSubItemField('${sub._originalId}', ${sub._originalIdx}, 'repSerialNo', this.value)" style="width: 100%; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" placeholder="Rep Serial No" />
                                                                </td>
                                                                <td style="padding: 6px 12px;">
                                                                    <input type="text" value="${sub.additionalRemarks || ''}" onchange="updateSubItemField('${sub._originalId}', ${sub._originalIdx}, 'additionalRemarks', this.value)" style="width: 100%; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" placeholder="Addl Remarks..." />
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

        function updateSubItemField(id, index, field, value) {
            const entry = entries.find(e => e._id === id);
            if (entry && entry.itemDetails && entry.itemDetails[index]) {
                entry.itemDetails[index][field] = value;
            }
        }

        async function acceptSubItem(id, index, btn) {
            const entry = entries.find(e => e._id === id);
            if (!entry) return;
            entry.itemDetails[index].isReplaced = true;
            btn.style.background = 'gray';
            btn.textContent = 'Accepted';
            btn.disabled = true;
            
            // Check if all items are replaced now
            const allReplaced = entry.itemDetails.every(item => item.isReplaced);
            
            try {
                const body = { itemDetails: entry.itemDetails };
                if (allReplaced) {
                    body.isReplaced = true;
                }
                
                await fetch('/api/inward/' + id, {
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

        