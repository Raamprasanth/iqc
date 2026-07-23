const fs = require('fs');

let html = fs.readFileSync('public/frontend/inward.html', 'utf8');

// Update Title and Headers
html = html.replace(/<title>.*?<\/title>/, '<title>Master Parts Catalog — SCHILLER Healthcare India</title>');
html = html.replace(/<h1>Inward Register<\/h1>/, '<h1>Master Parts Catalog</h1>');
html = html.replace(/<p>All material inward entries logged at the receiving dock — Puducherry &amp; Bengaluru\.<\/p>/, '<p>Admin view of all unique Models, Part Numbers, and Descriptions loaded from the Excel file.</p>');
html = html.replace(/<h2>Logged Entries<\/h2>/, '<h2>Models & Parts Catalog</h2>');
html = html.replace(/<span class="badge" id="iqcInwardBadge">0<\/span>/g, '');
html = html.replace(/<span class="badge" id="iqcRejectedBadge">0<\/span>/g, '');
html = html.replace(/<span class="badge" id="iqcReInwardBadge">0<\/span>/g, '');

// Sidebar from admin.html
let adminHtml = fs.readFileSync('public/frontend/admin.html', 'utf8');
const adminSidebarMatch = adminHtml.match(/<aside class="sidebar" id="sidebar">[\s\S]*?<\/aside>/);
if (adminSidebarMatch) {
    html = html.replace(/<aside class="sidebar" id="sidebar">[\s\S]*?<\/aside>/, adminSidebarMatch[0]);
    html = html.replace(/<div class="sb-item active" onclick="navigate\('user-management', this\)">/g, '<div class="sb-item" onclick="window.location.href=\'admin.html\'">');
    html = html.replace(/<div class="sb-item" onclick="window\.location\.href='inwardip\.html'">/g, '<div class="sb-item active" onclick="window.location.href=\'inwardip.html\'">');
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
const newHeaders = `<th>Total Parts</th>
                                    <th></th>`;
html = html.replace(/<th>Date<\/th>[\s\S]*?<th>Total Quantity<\/th>[\s\S]*?<th><\/th>/, `<th>Model Name</th>\n                                    <th>Total Associated Parts</th>\n                                    <th></th>`);

// Replace script block with our own custom script for Inward IP
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

        let partsData = [];
        const tableBody = document.getElementById('entryTableBody');
        const tableWrap = document.getElementById('tableWrap');
        const emptyState = document.getElementById('emptyState');
        const entryCount = document.getElementById('entryCount');
        const searchInput = document.getElementById('searchInput');

        async function fetchEntries() {
            try {
                const res = await fetch('/api/parts');
                if (res.ok) {
                    partsData = await res.json();
                    renderTable();
                }
            } catch (err) {
                console.error('Error fetching parts:', err);
            }
        }

        function renderTable() {
            const query = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
            const filtered = partsData.filter(e =>
                !query || e.model.toLowerCase().includes(query) || e.partNo.toLowerCase().includes(query) || (e.description && e.description.toLowerCase().includes(query))
            );

            // Group by Model
            const groups = {};
            filtered.forEach(e => {
                const key = e.model || 'UNKNOWN';
                if (!groups[key]) {
                    groups[key] = { model: key, parts: [] };
                }
                groups[key].parts.push(e);
            });

            const groupedArray = Object.values(groups).sort((a,b) => a.model.localeCompare(b.model));
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
                html += \`
                <tr class="group-row" style="transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer; width: 60px;">\${i + 1}</td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;"><span class="cell-part" style="font-weight: 600;">\${g.model}</span></td>
                    <td onclick="toggleSubRow('subrow-\${i}')" style="cursor:pointer;"><strong>\${g.parts.length}</strong> Unique Parts</td>
                    <td style="text-align: right; cursor:pointer;" onclick="toggleSubRow('subrow-\${i}')">
                        <span style="font-size: 0.75rem; color: var(--steel);">&#9660;</span>
                    </td>
                </tr>
                <tr id="subrow-\${i}" style="display: none; background: #fafbfc;">
                    <td colspan="4" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 15px 30px;">
                            <table style="width:100%; border-collapse:collapse; font-size: 0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0; width: 150px;">Part Number</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${g.parts.map(p => {
                                        return \`
                                        <tr>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--indigo); font-family: monospace; font-size: 0.9rem;"><strong>\${p.partNo}</strong></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">\${p.description || '-'}</td>
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

        if(searchInput) {
            searchInput.addEventListener('input', renderTable);
        }

        // Init
        fetchEntries();
    </script>
</body>
</html>`;

fs.writeFileSync('public/frontend/inwardip.html', html);
console.log("Created inwardip.html successfully");
