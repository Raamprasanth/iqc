const fs = require('fs');

let inwardHtml = fs.readFileSync('public/frontend/inward.html', 'utf8');

const targetStr = `                if (acceptQty > 0) {
                    acceptedList.push({ ...baseData, quantity: acceptQty, totalQuantity: totalQty, grnNo: input.getAttribute('data-grn'), remarks: remarks });
                    inwardpList.push({ ...baseData, quantity: acceptQty, grnNo: input.getAttribute('data-grn'), remarks: '' });
                }`;

const replaceStr = `                if (acceptQty > 0) {
                    const yetQty = Math.max(0, totalQty - acceptQty);
                    acceptedList.push({ ...baseData, quantity: acceptQty, totalQuantity: totalQty, grnNo: input.getAttribute('data-grn'), remarks: remarks, yetToAcceptQty: yetQty });
                    inwardpList.push({ ...baseData, quantity: acceptQty, grnNo: input.getAttribute('data-grn'), remarks: '' });
                }`;

inwardHtml = inwardHtml.replace(targetStr, replaceStr);

fs.writeFileSync('public/frontend/inward.html', inwardHtml);
console.log("Fixed inward.html");
