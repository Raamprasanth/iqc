const fs = require('fs');

let html = fs.readFileSync('public/frontend/firstrep.html', 'utf8');

// 1. Add subIndex and parentId to extracted items
html = html.replace(
    'item.itemDetails.forEach(subItem => {',
    'item.itemDetails.forEach((subItem, subIndex) => {'
);
html = html.replace(
    'repSerialNo: subItem.repSerialNo,',
    'repSerialNo: subItem.repSerialNo,\n                                    parentId: item._id,\n                                    subIndex: subIndex,'
);

// 2. Change the TD for Additional Remarks to an input
html = html.replace(
    '<td style="padding:8px; border-bottom: 1px solid #f1f5f9;">${p.additionalRemarks || \'-\'}</td>',
    '<td style="padding:8px; border-bottom: 1px solid #f1f5f9;"><input type="text" value="${p.additionalRemarks || \'\'}" placeholder="Write info..." style="width: 100%; min-width: 120px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; font-size: 0.75rem;" onchange="saveAdditionalRemarks(\'${p.parentId}\', ${p.subIndex}, this.value, this)" onclick="event.stopPropagation()"></td>'
);

// 3. Add the saveAdditionalRemarks function
const newFn = `
        window.saveAdditionalRemarks = async function(parentId, subIndex, val, inputElem) {
            if (parentId === 'undefined' || subIndex === undefined) return;
            try {
                inputElem.style.opacity = '0.5';
                const updates = {};
                updates[\`itemDetails.\${subIndex}.additionalRemarks\`] = val;
                
                const res = await fetch('/api/rejected-iqc/' + parentId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
                
                if (res.ok) {
                    inputElem.style.borderColor = '#1E7B4D';
                    setTimeout(() => inputElem.style.borderColor = '#e2e8f0', 2000);
                } else {
                    alert('Failed to save remarks');
                }
            } catch (e) {
                console.error(e);
                alert('Error connecting to server');
            } finally {
                inputElem.style.opacity = '1';
            }
        };

        window.acceptAndReduceYetToAccept`;

html = html.replace('        window.acceptAndReduceYetToAccept', newFn);

fs.writeFileSync('public/frontend/firstrep.html', html);
console.log("Updated successfully!");
