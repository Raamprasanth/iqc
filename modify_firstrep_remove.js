const fs = require('fs');
let html = fs.readFileSync('public/frontend/firstrep.html', 'utf8');

// 1. Update extraction logic
html = html.replace(
    'if (subItem.isReplaced) {',
    'if (subItem.isReplaced && !subItem.isAccepted) {'
);

// 2. Update button onclick
html = html.replace(
    `onclick="event.stopPropagation(); acceptAndReduceYetToAccept('\${p.batchId}', '\${p.partNo}', \${p.quantity || p.qty || 1}, this)"`,
    `onclick="event.stopPropagation(); acceptAndReduceYetToAccept('\${p.batchId}', '\${p.partNo}', \${p.quantity || p.qty || 1}, '\${p.parentId}', \${p.subIndex}, this)"`
);

// 3. Update acceptAndReduceYetToAccept function
const oldFnStart = 'window.acceptAndReduceYetToAccept = async function(batchId, partNo, qty, btn) {';
const newFn = `window.acceptAndReduceYetToAccept = async function(batchId, partNo, qty, parentId, subIndex, btn) {
            if (!confirm('Mark as finally accepted? This will reduce the "Yet to Accept" quantity in Accepted IQC.')) return;
            try {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                
                // 1. Reduce yetToAcceptQty in AcceptedIqc
                const res = await fetch('/api/accepted-iqc/reduce-yet-to-accept', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ batchId, partNo, reduceBy: qty, source: 'Re-Inward IQC' })
                });
                
                // 2. Mark this subItem as isAccepted in RejectedIqc so it stops showing up here
                if (parentId && parentId !== 'undefined' && subIndex !== undefined) {
                    const updates = {};
                    updates[\`itemDetails.\${subIndex}.isAccepted\`] = true;
                    await fetch('/api/rejected-iqc/' + parentId, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });
                }
                
                if (res.ok) {
                    btn.innerHTML = '<span style="color:#1E7B4D;font-weight:bold;font-size:0.8rem;">Accepted</span>';
                    const toast = document.getElementById('saveToast');
                    if (toast) {
                        toast.querySelector('span').textContent = 'Successfully updated Accepted IQC.';
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 3000);
                    }
                    
                    // Remove row from table
                    const tr = btn.closest('tr');
                    if (tr) {
                        tr.style.transition = 'opacity 0.4s';
                        tr.style.opacity = '0';
                        setTimeout(() => tr.remove(), 400);
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
            }`;

const startIdx = html.indexOf(oldFnStart);
const catchEndIdx = html.indexOf('}', html.indexOf('catch', startIdx)) + 1; // finds the end of the catch block

if (startIdx !== -1 && catchEndIdx !== 0) {
    const oldFnComplete = html.substring(startIdx, catchEndIdx);
    html = html.replace(oldFnComplete, newFn);
    fs.writeFileSync('public/frontend/firstrep.html', html);
    console.log("Success");
} else {
    console.log("Failed to find function");
}
