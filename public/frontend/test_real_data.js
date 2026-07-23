
const http = require('http');

http.get('http://localhost:3000/api/inward', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const allData = JSON.parse(data);
        const entries = allData.filter(e => e.source === 'inwardp' && e.status === 'Rejected');
        console.log('Fetched entries:', entries.length);
        
        try {
            const grouped = groupEntries(entries);
            console.log('Grouped successfully:', grouped.length);
            
            // Try formatting first group
            if (grouped.length > 0) {
                console.log('First group merged parts length:', Object.values(grouped[0].mergedParts).length);
            }
        } catch(e) {
            console.error('Error grouping:', e);
        }
    });
});

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
            items.push({ nature, qty });
        });
    } else {
        items.push({ nature: '-', qty: totalQty });
    }
    return items;
}
function groupEntries(data) {
            const groups = {};
            data.forEach(e => {
                if (!e.itemDetails || e.itemDetails.length === 0) {
                    e.itemDetails = parseRemarksToItems(e.remarks, Number(e.quantity || e.qty || 0));
                }

                // Check if the whole entry is already replaced or sent to re-inward
                if (e.reInwarded || e.sentToReInward || e.isReplaced) return;

                const d = e.date ? e.date.split('T')[0] : '';
                const inv = e.invoiceNo || '-';
                const key = inv + '|' + e.model;
                if (!groups[key]) {
                    groups[key] = { date: d, invoiceNo: inv, model: e.model, parts: [], totalQty: 0, rejections: [], mergedParts: {} };
                }

                let activeQty = 0;
                const activeSubItems = [];
                if (e.itemDetails) {
                    e.itemDetails.forEach((sub, idx) => {
                        if (!sub.isReplaced) {
                            activeQty += Number(sub.qty || 1);
                            activeSubItems.push({
                                ...sub,
                                _originalId: e._id,
                                _originalIdx: idx
                            });
                        }
                    });
                }

                // If no active rejected items left in this entry, skip it
                if (activeQty === 0 && activeSubItems.length === 0) return;

                groups[key].parts.push(e);
                groups[key].totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                groups[key].rejections.push(e);

                // Aggregate by partNo
                const pKey = e.partNo;
                if (!groups[key].mergedParts[pKey]) {
                    groups[key].mergedParts[pKey] = {
                        partNo: e.partNo,
                        partDescription: e.partDescription,
                        totalQty: 0,
                        qty: 0,
                        items: []
                    };
                }
                const m = groups[key].mergedParts[pKey];
                m.totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                m.qty += activeQty;
                
                m.items.push(...activeSubItems);
            });
            
            // Filter out groups with 0 parts
            const finalGroups = Object.values(groups).filter(g => g.parts.length > 0);
            return finalGroups;
        }

