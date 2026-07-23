const fs = require('fs');

let html = fs.readFileSync('public/frontend/inward.html', 'utf8');

// Update Title and Headers
html = html.replace(/<title>.*?<\/title>/, '<title>Inward Admin — SCHILLER Healthcare India</title>');
html = html.replace(/<h1>Inward Register<\/h1>/, '<h1>Inward Admin</h1>');
html = html.replace(/<p>All material inward entries logged at the receiving dock — Puducherry &amp; Bengaluru\.<\/p>/, '<p>Admin view of all Inward (IQC) and Inward (Production) entries. Manage and delete as needed.</p>');
html = html.replace(/<h2>Logged Entries<\/h2>/, '<h2>All Inward Entries</h2>');
html = html.replace(/<span class="badge" id="iqcInwardBadge">0<\/span>/g, '');
html = html.replace(/<span class="badge" id="iqcRejectedBadge">0<\/span>/g, '');
html = html.replace(/<span class="badge" id="iqcReInwardBadge">0<\/span>/g, '');

// Fix Sidebar active states
html = html.replace(/class="sidebar-link active"/g, 'class="sidebar-link"');
// Wait, we don't have "Inward Admin" in the sidebar in inward.html since I only added it to admin.html. Let's just remove active from Inward Register.
// Actually, this is an admin module page, so maybe the sidebar should look like admin.html's sidebar!
// Yes, admin.html sidebar only has User Management, Inward Admin, and Settings.
// I will copy the sidebar from admin.html to acceptedip.html later or in this script.

let adminHtml = fs.readFileSync('public/frontend/admin.html', 'utf8');
const adminSidebarMatch = adminHtml.match(/<aside class="sidebar" id="sidebar">[\s\S]*?<\/aside>/);
if (adminSidebarMatch) {
    html = html.replace(/<aside class="sidebar" id="sidebar">[\s\S]*?<\/aside>/, adminSidebarMatch[0]);
    // Set active link for Inward Admin
    html = html.replace(/<div class="sb-item" onclick="window\.location\.href='acceptedip\.html'">/g, '<div class="sb-item active" onclick="window.location.href=\'acceptedip.html\'">');
    html = html.replace(/<div class="sb-item active" onclick="navigate\('user-management', this\)">/g, '<div class="sb-item" onclick="window.location.href=\'admin.html\'">');
}

// Remove the Add New view
html = html.replace(/<!-- ═══════════ ADD NEW VIEW ═══════════ -->[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*<\/div>/, '');
// Remove Topbar tabs
html = html.replace(/<div class="topbar-tabs">[\s\S]*?<\/div>\s*<\/div>/, '</div>');
// Remove head actions (Add New button)
html = html.replace(/<div class="head-actions">[\s\S]*?<\/div>/, '');
// Remove Empty State Add btn
html = html.replace(/<button class="btn-new" id="emptyAddBtn">[\s\S]*?<\/button>/, '');

// Update Table Headers
const oldHeaders = `<th>Total Parts</th>
                                    <th>Total Quantity</th>
                                    <th></th>`;
const newHeaders = `<th>Source</th>
                                    <th>Total Parts</th>
                                    <th>Total Qty</th>
                                    <th>Actions</th>
                                    <th></th>`;
html = html.replace(oldHeaders, newHeaders);

// Replace script block with our own custom script for Inward Admin
const scriptStart = html.indexOf('<script>');
html = html.substring(0, scriptStart) + `<script>
        const sidebar = document.getElementById('sidebar');
        const scrim = document.getElementById('scrim');
        const menuToggle = document.getElementById('menuToggle');

        function openSidebar() {
            sidebar.classList.add('open');
            scrim.classList.add('show');
        }
        function closeSidebar() {
            sidebar.classList.remove('open');
            scrim.classList.remove('show');
        }
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
            });
        }
        if (scrim) {
            scrim.addEventListener('click', closeSidebar);
        }

        function formatDateDisplay(isoDate) {
            if(!isoDate) return '-';
            const parts = isoDate.split('-');
            if(parts.length !== 3) return isoDate;
            const [y, m, d] = parts;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return \`\${d} \${months[parseInt(m, 10) - 1]} \${y}\`;
        }

        let entries = [];
        const tableBody = document.getElementById('entryTableBody');
        const tableWrap = document.getElementById('tableWrap');
        const emptyState = document.getElementById('emptyState');
        const entryCount = document.getElementById('entryCount');
        const searchInput = document.getElementById('searchInput');

        async function fetchEntries() {
            try {
                const [resIQC, resProd] = await Promise.all([
                    fetch('/api/inward'),
                    fetch('/api/inwardp')
                ]);
                
                let iqcData = [];
                let prodData = [];
                
                if (resIQC.ok) iqcData = await resIQC.json();
                if (resProd.ok) prodData = await resProd.json();
                
                iqcData = iqcData.map(e => ({...e, source: 'IQC'}));
                prodData = prodData.map(e => ({...e, source: 'Production'}));
                
                entries = [...iqcData, ...prodData];
                
                // Sort by date descending
                entries.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
                
                renderTable();
            } catch (err) {
                console.error('Error fetching entries:', err);
            }
        }

        function renderTable() {
            const query = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
            const filtered = entries.filter(e =>
                !query || e.model.toLowerCase().includes(query) || e.partNo.toLowerCase().includes(query) || (e.partDescription && e.partDescription.toLowerCase().includes(query))
            );

            // Group by Date + Invoice + Model + Source
            const groups = {};
            filtered.forEach(e => {
                const d = e.date ? e.date.split('T')[0] : '';
                const inv = e.invoiceNo || '-';
                const key = d + '|' + inv + '|' + e.model + '|' + e.source;
                if (!groups[key]) {
                    groups[key] = { date: d, invoiceNo: inv, model: e.model, source: e.source, parts: [], totalQty: 0, ids: [] };
                }
                groups[key].parts.push(e);
                groups[key].totalQty += Number(e.quantity || e.qty || 0);
                groups[key].ids.push(e._id);
            });

            const groupedArray = Object.values(groups);
            if(entryCount) entryCount.textContent = groupedArray.length;

            if (groupedArray.length === 0) {
                if(tableWrap) tableWrap.style.display = 'none';
                if(emptyState) emptyState.style.display = 'flex';
                return;
            }
            if(tableWrap) tableWrap.style.display = 'block';
            if(emptyState) emptyState.style.display = 'none';

            let html = '';
            groupedArray.forEach((g, i) => {
                const badgeColor = g.source === 'IQC' ? 'var(--navy)' : 'var(--amber)';
                html += \`
                <tr class="group-row" style="transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;">\${i + 1}</td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;"><span class="cell-part">\${formatDateDisplay(g.date)}</span></td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;"><span class="cell-part">\${g.invoiceNo !== '-' ? g.invoiceNo : '<span style="color:var(--steel); font-weight:normal;">N/A</span>'}</span></td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;"><span class="cell-part">\${g.model}</span></td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;"><span style="background:\${badgeColor}; color:white; padding: 2px 6px; border-radius: 4px; font-size:0.75rem;">\${g.source}</span></td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;"><strong>\${g.parts.length}</strong> Parts</td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;">\${g.totalQty.toLocaleString('en-IN')}</td>
                    <td>
                        <button onclick="deleteGroup('\${g.ids.join(',')}', '\${g.source}')" style="background:var(--red); color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;">Delete Group</button>
                    </td>
                    <td style="text-align: right; cursor:pointer;" onclick="toggleSubRow('subrow-\${i}')">
                        <span style="font-size: 0.75rem; color: var(--steel);">&#9660;</span>
                    </td>
                </tr>
                <tr id="subrow-\${i}" style="display: none; background: #fafbfc;">
                    <td colspan="9" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 15px 30px;">
                            <table style="width:100%; border-collapse:collapse; font-size: 0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part No.</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Description</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Inward Qty</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Status</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${g.parts.map(p => {
                                        const qty = Number(p.quantity || p.qty || 0);
                                        return \`
                                        <tr>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9;"><strong>\${p.partNo}</strong></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">\${p.partDescription || '-'}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;">\${qty.toLocaleString('en-IN')}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right;">\${p.status || 'Pending'}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;">
                                                <button onclick="deleteSingle('\${p._id}', '\${g.source}')" style="background:transparent; color:var(--red); border:1px solid var(--red); padding:2px 6px; border-radius:4px; font-size:0.7rem; cursor:pointer;">Delete</button>
                                            </td>
                                        </tr>
                                    \`}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                \`;
            });
            if(tableBody) tableBody.innerHTML = html;
        }

        window.toggleSubRow = function(id) {
            const el = document.getElementById(id);
            if (el.style.display === 'none') {
                el.style.display = 'table-row';
            } else {
                el.style.display = 'none';
            }
        };

        window.deleteGroup = async function(idsStr, source) {
            if (!confirm('Are you sure you want to delete this group? This will permanently remove it from the system.')) return;
            const ids = idsStr.split(',');
            const endpoint = source === 'IQC' ? '/api/inward/' : '/api/inwardp/';
            try {
                await Promise.all(ids.map(id => fetch(endpoint + id, { method: 'DELETE' })));
                fetchEntries();
            } catch (err) {
                console.error('Failed to delete', err);
                alert('Error deleting group.');
            }
        };
        
        window.deleteSingle = async function(id, source) {
            if (!confirm('Are you sure you want to delete this single entry?')) return;
            const endpoint = source === 'IQC' ? '/api/inward/' : '/api/inwardp/';
            try {
                await fetch(endpoint + id, { method: 'DELETE' });
                fetchEntries();
            } catch (err) {
                console.error('Failed to delete', err);
                alert('Error deleting entry.');
            }
        };

        if(searchInput) {
            searchInput.addEventListener('input', renderTable);
        }

        // Init
        fetchEntries();
    </script>
</body>
</html>`;

fs.writeFileSync('public/frontend/acceptedip.html', html);
console.log("Created acceptedip.html successfully");
