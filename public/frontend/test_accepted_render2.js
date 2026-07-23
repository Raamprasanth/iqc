
const entries = [
    {
        _id: '123',
        source: 'inwardp',
        date: '2024-11-20T10:00:00Z',
        invoiceNo: 'INV-123',
        model: 'ModelX',
        partNo: 'P-123',
        partDescription: 'Desc',
        quantity: 5,
        totalQuantity: 10,
        remarks: '5 damaged',
        itemDetails: [
            { isReplaced: true, qty: 2 },
            { isReplaced: false, qty: 3 }
        ]
    }
];

const document = {
    getElementById: function(id) {
        return {
            value: '',
            style: {},
            textContent: '',
            innerHTML: '',
            addEventListener: function() {}
        };
    },
    querySelectorAll: function() { return []; }
};
const window = { toggleSubRow: () => {}, toggleSubItemRow: () => {} };
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('tableBody');
const entryCount = document.getElementById('entryCount');
const tableWrap = document.getElementById('tableWrap');
const emptyState = document.getElementById('emptyState');

function formatDateDisplay(d) { return d; }

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
                const res = await fetch('/api/acceptedpro');
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
        async function fetchInwardpCount() {
            try {
                const res = await fetch('/api/inwardp');
                if (res.ok) {
                    const data = await res.json();
                    const badge = document.getElementById('productionInwardBadge');
                    if (badge) badge.textContent = data.length;
                }
            } catch (err) {
                console.error('Error fetching production inward count:', err);
            }
        }

        async function fetchReInwardCount() {
            try {
                const res = await fetch('/api/reinwardpro');
                if (res.ok) {
                    const data = await res.json();
                    const badge = document.getElementById('productionReInwardBadge');
                    if (badge) badge.textContent = data.length;
                }
            } catch (err) {
                console.error('Error fetching reinward count:', err);
            }
        }

        async function fetchRejectedproCount() {
            try {
                const res = await fetch('/api/rejectedpro');
                if (res.ok) {
                    const data = await res.json();
                    const badge = document.getElementById('productionRejectedBadge');
                    if (badge) badge.textContent = data.length;
                }
            } catch (err) {
                console.error('Error fetching rejected pro count:', err);
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
                const d = e.date ? e.date.split('T')[0] : '';
                const inv = e.invoiceNo || '-';
                const key = inv + '|' + e.model;
                if (!groups[key]) {
                    groups[key] = { date: d, invoiceNo: inv, model: e.model, parts: [], totalQty: 0, ids: [], mergedParts: {} };
                }
                groups[key].parts.push(e);
                groups[key].totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                groups[key].ids.push(e._id);
                
                const pKey = e.partNo;
                if (!groups[key].mergedParts[pKey]) {
                    groups[key].mergedParts[pKey] = {
                        partNo: e.partNo,
                        partDescription: e.partDescription,
                        totalQuantity: 0,
                        qty: 0,
                        yetToAcceptQty: 0,
                        yetToAcceptUpdatedAt: null,
                        ids: []
                    };
                }
                
                const m = groups[key].mergedParts[pKey];
                
                let origTotal = Number(e.totalQuantity || e.quantity || 0);
                let origAccepted = Number(e.quantity || e.qty || 0);
                
                // Parse remarks if itemDetails is missing
                if (!e.itemDetails || e.itemDetails.length === 0) {
                    e.itemDetails = parseRemarksToItems(e.remarks, origTotal - origAccepted);
                }
                
                let newlyAcceptedQty = 0;
                let activeRejectedQty = 0;
                
                if (e.itemDetails && e.itemDetails.length > 0) {
                    e.itemDetails.forEach(sub => {
                        if (sub.isReplaced) {
                            newlyAcceptedQty += Number(sub.qty || 1);
                        } else if (!e.reInwarded && !e.sentToReInward) {
                            activeRejectedQty += Number(sub.qty || 1);
                        }
                    });
                } else {
                    activeRejectedQty = Math.max(0, origTotal - origAccepted);
                }
                
                m.totalQuantity += origTotal;
                m.qty += origAccepted + newlyAcceptedQty;
                m.yetToAcceptQty += activeRejectedQty;
                
                // Track latest update
                if (newlyAcceptedQty > 0) {
                    const thisDate = new Date(e.updatedAt || new Date());
                    if (!m.yetToAcceptUpdatedAt || thisDate > new Date(m.yetToAcceptUpdatedAt)) {
                        m.yetToAcceptUpdatedAt = (e.updatedAt || new Date().toISOString());
                    }
                } else if (e.yetToAcceptUpdatedAt) {
                    const thisDate = new Date(e.yetToAcceptUpdatedAt);
                    if (!m.yetToAcceptUpdatedAt || thisDate > new Date(m.yetToAcceptUpdatedAt)) {
                        m.yetToAcceptUpdatedAt = e.yetToAcceptUpdatedAt;
                    }
                }
                
                m.ids.push(e._id);
            });
            
            return Object.values(groups);
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
                    onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'"
                    onclick="toggleSubRow('subrow-${i}')">
                    <td>${i + 1}</td>
                    <td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>
                    <td><span class="cell-part" style="font-weight:500;">${g.invoiceNo || '-'}</span></td>
                    <td><span class="cell-part">${g.model}</span></td>
                    <td><strong>${g.parts.length}</strong> Parts</td>
                    <td>${g.totalQty.toLocaleString('en-IN')}</td>
                    <td><span class="status-pill accepted">Accepted</span></td>
                    <td style="text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--steel); user-select:none;">&#9660; Details</span>
                    </td>
                </tr>
                <tr id="subrow-${i}" style="display: none; background: #fafbfc;">
                    <td colspan="8" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 15px 30px;">
                            <table style="width:100%; border-collapse:collapse; font-size: 0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part No.</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Description</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Inward Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--green); text-align:right; border-bottom:1px solid #e2e8f0;">Accepted Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:#d97706; text-align:right; border-bottom:1px solid #e2e8f0;">Yet to Accept Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0;">Last Updated</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.values(g.mergedParts).map((m, mIdx) => {
                                        const yetQty = m.yetToAcceptQty;
                                        const updatedAt = m.yetToAcceptUpdatedAt ? new Date(m.yetToAcceptUpdatedAt) : null;
                                        const updatedStr = updatedAt ? updatedAt.toLocaleString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '-';
                                        const history = m.yetToAcceptHistory || [];
                                        const last3 = history.slice(0,3);
                                        const historyRows = last3.length > 0
                                            ? last3.map(h => '<div style="padding:4px 0; border-bottom:1px solid #f1f5f9; font-size:0.75rem;"><span style="color:var(--green);font-weight:600;">-' + h.reducedBy + '</span> accepted &nbsp;<span style="color:var(--steel);">' + new Date(h.updatedAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) + '</span></div>').join('')
                                            : '<div style="color:var(--steel);font-size:0.75rem;">No updates yet</div>';
                                        // use the first id for popup uniqueness
                                        const popupId = 'yta-pop-' + i + '-' + mIdx;
                                        return '<tr>' +
                                            '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9;"><strong>' + m.partNo + '</strong></td>' +
                                            '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">' + (m.partDescription || '-') + '</td>' +
                                            '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;">' + Number(m.totalQuantity).toLocaleString('en-IN') + '</td>' +
                                            '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;">' + Number(m.qty).toLocaleString('en-IN') + '</td>' +
                                            '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;"><span style="font-weight:700; color:' + (yetQty > 0 ? '#d97706' : '#16a34a') + '; background:' + (yetQty > 0 ? '#fef3c7' : '#dcfce7') + '; padding:2px 8px; border-radius:10px;">' + yetQty + '</span></td>' +
                                            '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center; position:relative;">' +
                                                (updatedAt ? '<div class="yta-cell" style="cursor:pointer; position:relative; display:inline-block;" onclick="toggleYtaPopup(event, \'' + popupId + '\')">' +
                                                    '<span style="font-size:0.78rem; color:var(--navy); text-decoration:underline dotted;">' + updatedStr + '</span>' +
                                                    '<div id="' + popupId + '" style="display:none; position:absolute; z-index:200; right:0; top:110%; background:white; border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.13); padding:10px 14px; min-width:220px; text-align:left;">' +
                                                        '<div style="font-weight:600; color:var(--navy); margin-bottom:6px; font-size:0.8rem;">Last 3 Accepted Updates</div>' +
                                                        historyRows +
                                                    '</div></div>'
                                                : '<span style="color:var(--steel);font-size:0.78rem;">-</span>') +
                                            '</td>' +
                                            '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;"><span class="status-pill accepted">Accepted</span></td>' +
                                        '</tr>';
                                    }).join('')}
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

        window.toggleSubItemRow = function (id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        };

        window.toggleYtaPopup = function(event, popId) {
            event.stopPropagation();
            document.querySelectorAll('[id^="yta-pop-"]').forEach(el => {
                if (el.id !== popId) el.style.display = 'none';
            });
            const pop = document.getElementById(popId);
            if (pop) pop.style.display = pop.style.display === 'none' ? 'block' : 'none';
        };
        document.addEventListener('click', () => {
            document.querySelectorAll('[id^="yta-pop-"]').forEach(el => el.style.display = 'none');
        });

        searchInput.addEventListener('input', renderTable);

        /* ── Export ── */
        document.getElementById('exportBtn').addEventListener('click', () => {
            const rows = [['Sl.No.', 'Date', 'Invoice No.', 'Model', 'Part No.', 'Description', 'Quantity', 'Yet to Accept', 'Status']];
            let sl = 1;
            groupEntries(entries).forEach(g => {
                g.parts.forEach(p => {
                    rows.push([sl++, g.date, g.invoiceNo, g.model, p.partNo, p.partDescription || '', Number(p.quantity || p.qty || 0), Number(p.yetToAcceptQty || 0), 'Accepted']);
                });
            });
            const csv = rows.map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'accepted_pro_' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        });

        /* ── Init ── */
        
    
try {
    renderTable();
    console.log('AcceptedPro RenderTable finished successfully.');
    console.log('HTML Length:', tableBody.innerHTML.length);
} catch (e) {
    console.error('Runtime error:', e);
}
