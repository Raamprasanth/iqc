
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

        function getStageStyles(stage) {
            if (stage === 'Incoming QC') {
                return 'background: rgba(44, 74, 110, 0.1); color: var(--mid);';
            } else if (stage === 'Production') {
                return 'background: rgba(199, 123, 18, 0.1); color: var(--amber);';
            } else {
                return 'background: rgba(30, 123, 77, 0.1); color: var(--green);';
            }
        }

        /* ── State variables ── */
        let activeTab = 'accepted'; // 'accepted' or 'rejected'
        let dataSets = {
            accepted: { main: [] },
            rejected: { main: [] }
        };
        let inwardList = [];

        const tableBody = document.getElementById('entryTableBody');
        const tableWrap = document.getElementById('tableWrap');
        const emptyState = document.getElementById('emptyState');
        const entryCount = document.getElementById('entryCount');
        const searchInput = document.getElementById('searchInput');

        /* ── Load data ── */
        async function fetchAllData() {
            try {
                const [
                    inwardItems,
                    acceptedIqc,
                    rejectedIqc,
                    rejectedPro,
                    rejectedIp
                ] = await Promise.all([
                    fetch('/api/inward').then(r => r.ok ? r.json() : []),
                    fetch('/api/accepted-iqc').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejected-iqc').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejectedpro').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejected-ipqc').then(r => r.ok ? r.json() : [])
                ]);

                inwardList = inwardItems;
                dataSets.accepted.iqc = acceptedIqc;
                dataSets.rejected.iqc = rejectedIqc;
                dataSets.rejected.pro = rejectedPro;
                dataSets.rejected.ip = rejectedIp;

                // Union and mark source stage
                dataSets.accepted.main = [
                    ...acceptedIqc.map(item => ({ ...item, stage: 'Incoming QC' }))
                ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                let extractedRejected = [];
                rejectedIqc.forEach(item => {
                    if (item.itemDetails && item.itemDetails.length > 0) {
                        item.itemDetails.forEach(subItem => {
                            if (subItem.isReplaced) {
                                extractedRejected.push({
                                    ...item,
                                    quantity: subItem.qty || 1,
                                    repSerialNo: subItem.repSerialNo,
                                    additionalRemarks: subItem.additionalRemarks,
                                    remarks: (subItem.nature || '') + (subItem.serial ? ' (SN: ' + subItem.serial + ')' : ''),
                                    stage: 'Incoming QC'
                                });
                            }
                        });
                    } else if (item.isReplaced) {
                        extractedRejected.push({ ...item, stage: 'Incoming QC' });
                    }
                });
                // Add the ticked (replaced) items to the Accepted tab because they passed now
                dataSets.accepted.main = [
                    ...dataSets.accepted.main,
                    ...extractedRejected
                ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                // Rejected tab should have all actual rejected items
                dataSets.rejected.main = [
                    ...rejectedIqc.map(item => ({ ...item, stage: 'Incoming QC' })),
                    ...rejectedPro.map(item => ({ ...item, stage: 'Production' })),
                    ...rejectedIp.map(item => ({ ...item, stage: 'In-Process QC' }))
                ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                updateUI();
            } catch (err) {
                console.error('Error fetching report data:', err);
                updateUI();
            }
        }

        /* ── Tab Switching ── */
        window.switchTab = function(tab) {
            activeTab = tab;
            
            // Toggle active classes on tab buttons
            const tabAcc = document.getElementById('tabAccepted');
            if (tabAcc) tabAcc.classList.toggle('active', tab === 'accepted');

            // Update Page headers & titles
            const titleEl = document.getElementById('pageTitle');
            const descEl = document.getElementById('pageDescription');
            const bannerText = document.getElementById('bannerText');
            const tableTitle = document.getElementById('tableTitle');
            const kpiFinalCard = document.getElementById('kpiFinalCard');

            if (tab === 'accepted') {
                titleEl.textContent = 'Reinward from IQC';
                descEl.textContent = 'Traced items showing which stage they cleared successfully.';
                bannerText.textContent = 'This report contains all entries logged across Incoming QC, Production, and In-Process QC stages.';
                tableTitle.textContent = 'Report Register';
                
                // Color tweaks for KPI final card
                kpiFinalCard.className = 'kpi-card accent c-green';
                document.getElementById('kpiIqcLabel').textContent = 'IQC Accepted ';
                document.getElementById('kpiProLabel').textContent = 'Production Accepted ';
                document.getElementById('kpiFinalLabel').textContent = 'In-Process Accepted ';
            } else {
                titleEl.textContent = 'Reinward from IQC (Rejected)';
                descEl.textContent = 'Traced rejected items showing which stage they failed and got rejected.';
                bannerText.textContent = 'This report contains all rejected entries logged across Incoming QC, Production, and In-Process QC stages.';
                tableTitle.textContent = 'Rejected Report Register';

                // Color tweaks for KPI final card
                kpiFinalCard.className = 'kpi-card accent c-red';
                document.getElementById('kpiIqcLabel').textContent = 'IQC Rejected ';
                document.getElementById('kpiProLabel').textContent = 'Production Rejected ';
                document.getElementById('kpiFinalLabel').textContent = 'In-Process Rejected ';
            }

            updateUI();
        };

        function groupEntries(mainData, proList, iqcList) {
            const groups = {};
            mainData.forEach(e => {
                const d = e.date ? e.date.split('T')[0] : '';
                const key = e.invoiceNo || (d + '|' + e.model);
                if (!groups[key]) {
                    groups[key] = { invoiceNo: e.invoiceNo || 'N/A', date: d, model: e.model, partsMap: {}, parts: [], inwardTotal: 0, iqcTotal: 0, proTotal: 0, ipqcTotal: 0, rejections: [] };
                }
                
                const partNo = e.partNo;
                if (!groups[key].partsMap[partNo]) {
                    groups[key].partsMap[partNo] = {
                        partNo: partNo,
                        partDescription: e.partDescription || e.description || '-',
                        inwardQty: 0,
                        iqcQty: 0,
                        proQty: 0,
                        ipqcQty: 0,
                        iqcItem: null,
                        proItem: null,
                        ipqcItem: null,
                        repSerialNo: '',
                        additionalRemarks: '',
                        reportedDate: '',
                        remarks: ''
                    };
                }
                
                if (e.repSerialNo) {
                    groups[key].partsMap[partNo].repSerialNo = groups[key].partsMap[partNo].repSerialNo 
                        ? groups[key].partsMap[partNo].repSerialNo + ', ' + e.repSerialNo 
                        : e.repSerialNo;
                }
                if (e.additionalRemarks) {
                    groups[key].partsMap[partNo].additionalRemarks = groups[key].partsMap[partNo].additionalRemarks 
                        ? groups[key].partsMap[partNo].additionalRemarks + ' | ' + e.additionalRemarks 
                        : e.additionalRemarks;
                }
                if (e.reportedDate) {
                    groups[key].partsMap[partNo].reportedDate = e.reportedDate;
                }
                if (e.remarks) {
                    groups[key].partsMap[partNo].remarks = groups[key].partsMap[partNo].remarks 
                        ? groups[key].partsMap[partNo].remarks + ' | ' + e.remarks 
                        : e.remarks;
                }
                
                const qty = Number(e.quantity || e.qty || 0);
                if (e.stage === 'Incoming QC') {
                    groups[key].partsMap[partNo].iqcQty += qty;
                    groups[key].partsMap[partNo].iqcItem = { id: e._id, stage: 'IQC', quantity: qty, sentToReInward: e.sentToReInward, reInwarded: e.reInwarded };
                } else if (e.stage === 'Production') {
                    groups[key].partsMap[partNo].proQty += qty;
                    groups[key].partsMap[partNo].proItem = { id: e._id, stage: 'Production', quantity: qty, sentToReInward: e.sentToReInward, reInwarded: e.reInwarded };
                } else if (e.stage === 'In-Process QC') {
                    groups[key].partsMap[partNo].ipqcQty += qty;
                    groups[key].partsMap[partNo].ipqcItem = { id: e._id, stage: 'In-Process QC', quantity: qty, sentToReInward: e.sentToReInward, reInwarded: e.reInwarded };
                }

                if (activeTab === 'rejected') {
                    let dbStage = '';
                    if (e.stage === 'Incoming QC') dbStage = 'IQC';
                    else if (e.stage === 'Production') dbStage = 'Production';
                    else if (e.stage === 'In-Process QC') dbStage = 'In-Process QC';
                    
                    if (dbStage) {
                        groups[key].rejections.push({
                            id: e._id,
                            stage: dbStage,
                            sentToReInward: e.sentToReInward || false,
                            reInwarded: e.reInwarded || false
                        });
                    }
                }
            });

            const lots = Object.values(groups);

            lots.forEach(lot => {
                Object.values(lot.partsMap).forEach(part => {
                    // Fill inwardQty from matching records in Inward table
                    const inwardMatches = inwardList.filter(p => p.partNo === part.partNo && p.model === lot.model);
                    part.inwardQty = inwardMatches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);

                    // Try to fill IQC Qty from matching records in IQC table if not already resolved
                    if (part.iqcQty === 0) {
                        const matches = iqcList.filter(p => p.partNo === part.partNo && p.model === lot.model);
                        part.iqcQty = matches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);
                    }
                    // Try to fill Production Qty from matching records in Production table if not already resolved
                    if (part.proQty === 0) {
                        const matches = proList.filter(p => p.partNo === part.partNo && p.model === lot.model);
                        part.proQty = matches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);
                    }
                    // Try to fill IPQC Qty from matching records in IPQC table if not already resolved
                    if (part.ipqcQty === 0) {
                        const matches = mainData.filter(p => p.stage === 'In-Process QC' && p.partNo === part.partNo && p.model === lot.model);
                        part.ipqcQty = matches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);
                    }

                    // Always calculate rejected quantities for the dropdown
                    const rejectedIqcMatches = dataSets.rejected.iqc.filter(p => p.partNo === part.partNo && p.model === lot.model);
                    part.iqcRejectedQty = rejectedIqcMatches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);

                    lot.inwardTotal += part.inwardQty;
                    lot.iqcTotal += part.iqcQty;
                    lot.proTotal += part.proQty;
                    lot.ipqcTotal += part.ipqcQty;

                    lot.parts.push(part);
                });
            });

            return lots;
        }

        /* ── Update KPIs & Tables ── */
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
            const grouped = groupEntries(filteredMain, currentSet.pro || [], currentSet.iqc || []);

            // Calculate KPIs
            const totalLots = grouped.length;
            
            let totalInward = 0;
            let totalIqc = 0;
            let totalPro = 0;
            let totalFinal = 0;
            let totalPartLines = 0;

            grouped.forEach(g => {
                totalInward += g.inwardTotal;
                totalIqc += g.iqcTotal;
                totalPro += g.proTotal;
                totalFinal += g.ipqcTotal;
                totalPartLines += g.parts.length;
            });

            // Update KPI Displays
            document.getElementById('kpiLots').textContent = totalLots;
            document.getElementById('kpiParts').textContent = totalPartLines;
            document.getElementById('kpiInwardQty').textContent = totalInward.toLocaleString('en-IN');
            document.getElementById('kpiIqcQty').textContent = totalIqc.toLocaleString('en-IN');
            document.getElementById('kpiProQty').textContent = totalPro.toLocaleString('en-IN');
            document.getElementById('kpiFinalQty').textContent = totalFinal.toLocaleString('en-IN');

            // Update Column headers with sum totals
            const inwardColHeader = document.getElementById('inwardColHeader');
            const iqcColHeader = document.getElementById('iqcColHeader');
            const proColHeader = document.getElementById('proColHeader');
            const ipqcColHeader = document.getElementById('ipqcColHeader');

            if (inwardColHeader) {
                inwardColHeader.innerHTML = `Total Inward<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalInward.toLocaleString('en-IN')}</small>`;
            }

            const labelSuffix = activeTab === 'accepted' ? 'Accepted' : 'Rejected';
            if (iqcColHeader) {
                iqcColHeader.innerHTML = `IQC ${labelSuffix}<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalIqc.toLocaleString('en-IN')}</small>`;
            }
            if (proColHeader) {
                proColHeader.innerHTML = `Production ${labelSuffix}<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalPro.toLocaleString('en-IN')}</small>`;
            }
            if (ipqcColHeader) {
                ipqcColHeader.innerHTML = `In-Process ${labelSuffix}<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalFinal.toLocaleString('en-IN')}</small>`;
            }

            entryCount.textContent = totalLots;

            // Render Table
            if (totalLots === 0) {
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
                    <td><span class="cell-part">${g.model}</span></td>
                    <td style="text-align: right;"><strong>${g.inwardTotal.toLocaleString('en-IN')}</strong></td>
                    <td style="text-align: right;"><strong>${g.iqcTotal.toLocaleString('en-IN')}</strong></td>
                    <td style="text-align: right;"><strong>${g.proTotal.toLocaleString('en-IN')}</strong></td>
                    <td style="text-align: right;"><strong>${g.ipqcTotal.toLocaleString('en-IN')}</strong></td>
                    <td>${renderStatusCell(g)}</td>
                    <td style="text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--steel); user-select:none;">&#9660; Details</span>
                    </td>
                </tr>
                <tr id="subrow-${i}" style="display: none; background: #fafbfc;">
                    <td colspan="12" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 18px 30px;">
                            <table style="width:100%; border-collapse:collapse; font-size: 0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part No.</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Description</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Total Inward</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Reported Date</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Rep Serial No</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Addl Remarks</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0;">History of Components</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${g.parts.map(p => `
                                        <tr>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9;"><strong>${p.partNo}</strong></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">${p.partDescription}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right; font-weight: 500;">
                                                ${p.inwardQty > 0 ? p.inwardQty.toLocaleString('en-IN') + '' : '—'}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                                <input type="date" id="date-${p.partNo}" class="input-field" style="width: 120px; font-size: 0.75rem;" value="${p.reportedDate || ''}" />
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                                <input type="text" id="serial-${p.partNo}" class="input-field" style="width: 120px; font-size: 0.75rem;" placeholder="Serial No" value="${p.repSerialNo || ''}" />
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                                <input type="text" id="addl-${p.partNo}" class="input-field" style="width: 140px; font-size: 0.75rem;" placeholder="Addl Remarks" value="${p.additionalRemarks || ''}" />
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; vertical-align: top;">
                                                <button class="btn-outline-navy" style="padding:4px 8px; font-size:0.75rem;" onclick="viewHistory('${p.partNo}')">View History</button>
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

        window.toggleSubRow = function(id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        };

        searchInput.addEventListener('input', updateUI);

        /* ── CSV Export ── */
        document.getElementById('exportBtn').addEventListener('click', () => {
            const currentSet = dataSets[activeTab];
            const statusLabel = activeTab === 'accepted' ? 'Passed' : 'Rejected';

            const headers = [
                'Sl.No.', 
                'Date', 
                'Model', 
                'Part No.', 
                'Description', 
                'Total Inward',
                `IQC ${activeTab === 'accepted' ? 'Accepted' : 'Rejected'}`, 
                `Production ${activeTab === 'accepted' ? 'Accepted' : 'Rejected'}`, 
                `In-Process ${activeTab === 'accepted' ? 'Accepted' : 'Rejected'}`
            ];
            const rows = [headers];
            let sl = 1;

            const filteredMain = currentSet.main.filter(e => {
                const query = searchInput.value.trim().toLowerCase();
                return !query ||
                    (e.model && e.model.toLowerCase().includes(query)) ||
                    (e.partNo && e.partNo.toLowerCase().includes(query)) ||
                    (e.partDescription && e.partDescription.toLowerCase().includes(query));
            });

            const grouped = groupEntries(filteredMain, currentSet.pro || [], currentSet.iqc || []);

            grouped.forEach(g => {
                const d = g.date ? g.date.split('T')[0] : '';
                g.parts.forEach(p => {
                    rows.push([
                        sl++,
                        d,
                        g.model,
                        p.partNo,
                        p.partDescription,
                        p.inwardQty,
                        p.iqcQty,
                        p.proQty,
                        p.ipqcQty
                    ]);
                });
            });

            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = `first_pass_report_${activeTab}_` + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        });

        function renderStatusCell(g) {
            const statusClass = activeTab === 'accepted' ? 'accepted' : 'rejected';
            const statusLabel = activeTab === 'accepted' ? 'Passed' : 'Rejected';
            
            let html = `<span class="status-pill ${statusClass}">${statusLabel}</span>`;
            
            if (activeTab === 'rejected' && g.rejections && g.rejections.length > 0) {
                const allReinspected = g.rejections.every(r => r.reInwarded);
                const allSent = g.rejections.every(r => r.sentToReInward || r.reInwarded);
                
                if (allReinspected) {
                    html += ` <span style="font-size:0.68rem;color:var(--green);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(30,123,77,0.1);border-radius:4px;">[Re-inspected]</span>`;
                } else if (allSent) {
                    html += ` <span style="font-size:0.68rem;color:var(--amber);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(199,123,18,0.1);border-radius:4px;">[In Completed]</span>`;
                } else {
                    const unsent = g.rejections.filter(r => !r.sentToReInward && !r.reInwarded);
                    const jsonStr = JSON.stringify(unsent).replace(/"/g, '&quot;');
                    html += ` <button onclick="event.stopPropagation(); sendLotToReInward('${jsonStr}', this)" style="margin-left:8px; padding: 4px 10px; font-size: 0.68rem; background: var(--navy); color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'Calibri', Calibri, sans-serif; font-weight: 600; transition: background 0.15s; outline: none;" onmouseover="this.style.background='#1A2B3C'" onmouseout="this.style.background='var(--navy)'">Send to Completed</button>`;
                }
            }
            return html;
        }

        function renderQtyCellPlain(qty) {
            if (qty <= 0) return '—';
            return `<strong>${qty.toLocaleString('en-IN')}</strong>`;
        }

        window.sendLotToReInward = async function(itemsJsonStr, btn) {
            try {
                let items = JSON.parse(itemsJsonStr);
                
                // Capture input values for each item
                items = items.map(item => {
                    const desc = document.getElementById('desc-' + item.partNo);
                    const serial = document.getElementById('serial-' + item.partNo);
                    const spare = document.getElementById('spare-' + item.partNo);
                    const reqqty = document.getElementById('reqqty-' + item.partNo);
                    const stage = document.getElementById('stage-' + item.partNo);
                    const date = document.getElementById('date-' + item.partNo);
                    
                    return {
                        ...item,
                        problemDescription: desc ? desc.value : '',
                        problemSerialNo: serial ? serial.value : '',
                        spareRequired: spare ? spare.value : '',
                        reqQty: reqqty ? reqqty.value : '',
                        problemStage: stage ? stage.value : '',
                        reportedDate: date ? date.value : ''
                    };
                });
                
                btn.disabled = true;
                btn.textContent = 'Sending...';
                const res = await fetch('/api/reinward/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items })
                });
                if (res.ok) {
                    const toast = document.getElementById('saveToast');
                    if (toast) {
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 3000);
                    }
                    fetchAllData();
                } else {
                    alert('Failed to send to Completed.');
                    btn.disabled = false;
                    btn.textContent = 'Send to Completed';
                }
            } catch (err) {
                console.error(err);
                alert('Error sending items to Completed.');
                btn.disabled = false;
                btn.textContent = 'Send to Completed';
            }
        };

        /* ── Init ── */
        fetchAllData();
    