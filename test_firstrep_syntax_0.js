
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

                function groupEntries(mainData) {
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
            if (document.getElementById('kpiLots')) document.getElementById('kpiLots').textContent = totalLots;
            if (document.getElementById('kpiParts')) document.getElementById('kpiParts').textContent = totalPartLines;
            
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
                htmlStr += `
                <tr class="main-row" onclick="toggleSubrow(${i})">
                    <td><span class="cell-part" style="font-weight: 700; color: var(--navy);">${g.invoiceNo}</span></td>
                    <td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>
                    <td><span class="cell-part">${g.model}</span></td>
                    <td>
                        <button class="btn-outline-navy" style="padding: 6px 12px; font-size: 0.8rem; pointer-events: none;">
                            View ${g.parts.length} Parts
                        </button>
                        ${activeTab === 'accepted' ? `<button onclick="event.stopPropagation(); sendLotToReInward('${jsonStr}', this)" style="margin-left:8px; padding: 4px 10px; font-size: 0.68rem; background: var(--navy); color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'Calibri', Calibri, sans-serif; font-weight: 600; transition: background 0.15s; outline: none;" onmouseover="this.style.background='#1A2B3C'" onmouseout="this.style.background='var(--navy)'">Send to Completed</button>` : ''}
                    </td>
                </tr>
                <tr id="subrow-${i}" style="display: none; background: #fafbfc;">
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
                                    ${g.parts.map(p => `
                                        <tr>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;"><strong>${p.partNo}</strong></td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9; color: var(--steel);">${p.partDescription || p.description || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;"><strong>${Number(p.quantity || p.qty || 0).toLocaleString('en-IN')}</strong></td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">${p.repSerialNo || p.problemSerialNo || p.recvSerialNo || p.serial || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">${p.additionalRemarks || p.remarks || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">
                                                <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 12px; background: ${activeTab==='accepted' ? 'var(--mint)' : 'rgba(239, 71, 111, 0.1)'}; color: ${activeTab==='accepted' ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">${p.stage || 'IQC'}</span>
                                            </td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                                                <button class="btn-outline-navy" style="padding:4px 8px; font-size:0.75rem;" onclick="viewHistory('${p.partNo}')">View History</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>`;
            });
            tableBody.innerHTML = htmlStr;
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
    