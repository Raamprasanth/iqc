const fs = require('fs');

let html = fs.readFileSync('public/frontend/firstrep.html', 'utf8');

// 1. Replace Headers
html = html.replace(
    `<th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Remarks</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Stage</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: center; color: var(--steel);">History</th>`,
    `<th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Remarks</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; color: var(--steel);">Additional Remarks</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: center; color: var(--steel);">Action</th>
                                        <th style="padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: center; color: var(--steel);">History</th>`
);

// 2. Replace Columns
html = html.replace(
    `<td style="padding:8px; border-bottom: 1px solid #f1f5f9;">\${p.additionalRemarks || p.remarks || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">
                                                <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 12px; background: \${activeTab==='accepted' ? 'var(--mint)' : 'rgba(239, 71, 111, 0.1)'}; color: \${activeTab==='accepted' ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">\${p.stage || 'IQC'}</span>
                                            </td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                                                <button class="btn-outline-navy" style="padding:4px 8px; font-size:0.75rem;" onclick="viewHistory('\${p.partNo}')">View History</button>
                                            </td>`,
    `<td style="padding:8px; border-bottom: 1px solid #f1f5f9;">\${p.remarks || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9;">\${p.additionalRemarks || '-'}</td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                                                <button title="Accept to reduce yet-to-accept qty" style="background:transparent; border:none; cursor:pointer;" onclick="event.stopPropagation(); acceptAndReduceYetToAccept('\${p.batchId}', '\${p.partNo}', \${p.quantity || p.qty || 1}, this)">
                                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="#1E7B4D" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </button>
                                            </td>
                                            <td style="padding:8px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                                                <button class="btn-outline-navy" style="padding:4px 8px; font-size:0.75rem;" onclick="event.stopPropagation(); viewHistory('\${p.partNo}')">View History</button>
                                            </td>`
);

// 3. Add JS function
const jsFunction = `
        window.acceptAndReduceYetToAccept = async function(batchId, partNo, qty, btn) {
            if (!confirm('Mark as finally accepted? This will reduce the "Yet to Accept" quantity in Accepted IQC.')) return;
            try {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                const res = await fetch('/api/accepted-iqc/reduce-yet-to-accept', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ batchId, partNo, reduceBy: qty, source: 'Re-Inward IQC' })
                });
                
                if (res.ok) {
                    btn.innerHTML = '<span style="color:#1E7B4D;font-weight:bold;font-size:0.8rem;">Accepted</span>';
                    const toast = document.getElementById('saveToast');
                    if (toast) {
                        toast.querySelector('span').textContent = 'Successfully updated Accepted IQC.';
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 3000);
                    }
                } else {
                    alert('Failed to update Accepted IQC.');
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            } catch (e) {
                console.error(e);
                alert('Error connecting to server.');
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        };

        window.toggleSubrow`;

html = html.replace('        window.toggleSubrow', jsFunction);

fs.writeFileSync('public/frontend/firstrep.html', html);
console.log("Replaced successfully!");
