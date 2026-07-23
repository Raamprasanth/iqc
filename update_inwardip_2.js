const fs = require('fs');

let html = fs.readFileSync('public/frontend/inwardip.html', 'utf8');

// We will inject the Add New form before the Models Catalog h2
const addNewBtnHtml = `
            <div class="head-actions" style="margin-bottom: 20px;">
                <button class="btn-new" onclick="toggleView('add')">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    Add New Part
                </button>
            </div>
`;

const formHtml = `
            <!-- ADD NEW VIEW -->
            <div class="view" id="viewAdd" style="display: none; margin-bottom: 30px;">
                <div class="card" style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h2 style="margin: 0;">Add New Part to Catalog</h2>
                        <button type="button" class="btn-outline-navy" style="padding: 6px 12px; font-size: 0.8rem;" onclick="toggleView('table')">Cancel</button>
                    </div>
                    <form id="addPartForm" onsubmit="addPart(event)">
                        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <label style="display:block; font-size: 0.8rem; font-weight: 600; color: var(--navy); margin-bottom: 5px;">Model Name <span style="color:var(--red);">*</span></label>
                                <input type="text" id="newModel" required style="width: 100%; padding: 8px; border: 1px solid var(--fog); border-radius: 6px;" placeholder="e.g. TS-III Basic" />
                            </div>
                            <div style="flex: 1;">
                                <label style="display:block; font-size: 0.8rem; font-weight: 600; color: var(--navy); margin-bottom: 5px;">Part No. <span style="color:var(--red);">*</span></label>
                                <input type="text" id="newPartNo" required style="width: 100%; padding: 8px; border: 1px solid var(--fog); border-radius: 6px;" placeholder="e.g. 60.000802A" />
                            </div>
                            <div style="flex: 2;">
                                <label style="display:block; font-size: 0.8rem; font-weight: 600; color: var(--navy); margin-bottom: 5px;">Part Description</label>
                                <input type="text" id="newDesc" style="width: 100%; padding: 8px; border: 1px solid var(--fog); border-radius: 6px;" placeholder="e.g. LCD Assembly" />
                            </div>
                        </div>
                        <button type="submit" class="btn-new" style="width: 100%;">Save Part</button>
                    </form>
                </div>
            </div>
`;

if (!html.includes('id="viewAdd"')) {
    html = html.replace('<h2>Models Catalog</h2>', addNewBtnHtml + formHtml + '\n<h2>Models Catalog</h2>');
}

// Add Delete column header
html = html.replace('<th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part Description</th>', '<th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part Description</th>\n<th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0; width: 60px;">Action</th>');

// Add Delete button in map
html = html.replace(/<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var\(--text\);">\\\$\{p\.description \|\| '-'\}.*?<\/td>/g, 
    `<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">\${p.description || '-'}</td>\n<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;"><button onclick="deletePart('\${p._id}')" style="background:transparent; color:var(--red); border:1px solid var(--red); padding:2px 6px; border-radius:4px; font-size:0.7rem; cursor:pointer;">Delete</button></td>`);

// Add JS functions
const jsFunctions = `
        window.toggleView = function(view) {
            if (view === 'add') {
                document.getElementById('viewAdd').style.display = 'block';
                document.getElementById('tableWrap').style.display = 'none';
            } else {
                document.getElementById('viewAdd').style.display = 'none';
                document.getElementById('tableWrap').style.display = 'block';
                document.getElementById('addPartForm').reset();
            }
        };

        window.addPart = async function(e) {
            e.preventDefault();
            const model = document.getElementById('newModel').value.trim();
            const partNo = document.getElementById('newPartNo').value.trim();
            const description = document.getElementById('newDesc').value.trim();
            
            try {
                const res = await fetch('/api/parts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model, partNo, description })
                });
                
                if (res.ok) {
                    toggleView('table');
                    fetchEntries();
                } else {
                    alert('Error saving part.');
                }
            } catch (err) {
                console.error(err);
                alert('Error connecting to server.');
            }
        };

        window.deletePart = async function(id) {
            if (!confirm('Are you sure you want to delete this part from the catalog?')) return;
            try {
                const res = await fetch('/api/parts/' + id, { method: 'DELETE' });
                if (res.ok) {
                    fetchEntries();
                } else {
                    alert('Error deleting part.');
                }
            } catch (err) {
                console.error(err);
                alert('Error connecting to server.');
            }
        };
`;

if (!html.includes('window.addPart')) {
    html = html.replace('window.toggleSubRow = function(id) {', jsFunctions + '\n        window.toggleSubRow = function(id) {');
}

fs.writeFileSync('public/frontend/inwardip.html', html);
console.log("Updated inwardip.html successfully");
