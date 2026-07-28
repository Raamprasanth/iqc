const fs = require('fs');

let inwardpHtml = fs.readFileSync('public/frontend/inwardp.html', 'utf8');

const targetStr = `                if (acceptQty > 0) {
                    acceptedList.push({ ...baseData, quantity: acceptQty, totalQuantity: totalQty, remarks: remarks });
                    // Production acceptance doesn't flow forward
                }`;

const replaceStr = `                if (acceptQty > 0) {
                    const yetQty = Math.max(0, totalQty - acceptQty);
                    acceptedList.push({ ...baseData, quantity: acceptQty, totalQuantity: totalQty, remarks: remarks, yetToAcceptQty: yetQty });
                    // Production acceptance doesn't flow forward
                }`;

inwardpHtml = inwardpHtml.replace(targetStr, replaceStr);

fs.writeFileSync('public/frontend/inwardp.html', inwardpHtml);
console.log("Fixed inwardp.html");
