const fs = require('fs');

// 1. Fix backend/routes/acceptedIqc.js
let acceptedIqcJs = fs.readFileSync('backend/routes/acceptedIqc.js', 'utf8');
acceptedIqcJs = acceptedIqcJs.replace(
    /const prevQty = entry\.yetToAcceptQty \|\| 0;\s*entry\.yetToAcceptQty = Math\.max\(0, prevQty - \(reduceBy \|\| 1\)\);/g,
    `let prevQty = entry.yetToAcceptQty || 0;
            if (prevQty === 0 && (!entry.yetToAcceptHistory || entry.yetToAcceptHistory.length === 0)) {
                const total = Number(entry.totalQuantity || entry.quantity || 0);
                const acc = Number(entry.quantity || 0);
                prevQty = Math.max(0, total - acc);
            }
            entry.yetToAcceptQty = Math.max(0, prevQty - (reduceBy || 1));`
);
fs.writeFileSync('backend/routes/acceptedIqc.js', acceptedIqcJs);

// 2. Fix backend/routes/acceptedpro.js
let acceptedProJs = fs.readFileSync('backend/routes/acceptedpro.js', 'utf8');
acceptedProJs = acceptedProJs.replace(
    /const prevQty = entry\.yetToAcceptQty \|\| 0;\s*entry\.yetToAcceptQty = Math\.max\(0, prevQty - \(reduceBy \|\| 1\)\);/g,
    `let prevQty = entry.yetToAcceptQty || 0;
            if (prevQty === 0 && (!entry.yetToAcceptHistory || entry.yetToAcceptHistory.length === 0)) {
                const total = Number(entry.totalQuantity || entry.quantity || 0);
                const acc = Number(entry.quantity || 0);
                prevQty = Math.max(0, total - acc);
            }
            entry.yetToAcceptQty = Math.max(0, prevQty - (reduceBy || 1));`
);
fs.writeFileSync('backend/routes/acceptedpro.js', acceptedProJs);

// 3. Fix public/frontend/acceptediqc.html
let acceptedIqcHtml = fs.readFileSync('public/frontend/acceptediqc.html', 'utf8');
const iqcReplaceLogic = `            if (rejectedList && rejectedList.length > 0 && baseYetQty > 0) {
                const inv = gInvoiceNo || p.invoiceNo || '';
                const mod = gModel || p.model || '';
                const matchingRej = rejectedList.filter(r => 
                    ((inv && r.invoiceNo === inv) || (r.model === mod)) &&
                    r.partNo === p.partNo
                );
                let replacedCount = 0;
                matchingRej.forEach(r => {
                    if (r.itemDetails && r.itemDetails.length > 0) {
                        r.itemDetails.forEach(item => {
                            if (item.isReplaced) replacedCount += Number(item.qty || 1);
                        });
                    } else if (r.isReplaced) {
                        replacedCount += Number(r.quantity || r.qty || 0);
                    }
                });
                baseYetQty = Math.max(0, baseYetQty - replacedCount);
            }`;
acceptedIqcHtml = acceptedIqcHtml.replace(iqcReplaceLogic, `// Frontend subtraction removed as backend handles it via firstrep.html`);
fs.writeFileSync('public/frontend/acceptediqc.html', acceptedIqcHtml);

// 4. Fix public/frontend/acceptedpro.html
let acceptedProHtml = fs.readFileSync('public/frontend/acceptedpro.html', 'utf8');
const proReplaceLogic = `            if (rejectedList && rejectedList.length > 0 && baseYetQty > 0) {
                const mod = p.model || '';
                const matchingRej = rejectedList.filter(r => (r.model === mod) && r.partNo === p.partNo);
                let replacedCount = 0;
                matchingRej.forEach(r => {
                    if (r.itemDetails && r.itemDetails.length > 0) {
                        r.itemDetails.forEach(item => {
                            if (item.isReplaced) replacedCount += Number(item.qty || 1);
                        });
                    } else if (r.isReplaced) {
                        replacedCount += Number(r.quantity || r.qty || 0);
                    }
                });
                baseYetQty = Math.max(0, baseYetQty - replacedCount);
            }`;
acceptedProHtml = acceptedProHtml.replace(proReplaceLogic, `// Frontend subtraction removed as backend handles it via firstrep.html`);
fs.writeFileSync('public/frontend/acceptedpro.html', acceptedProHtml);

console.log("Fixed yet to accept qty bugs");
