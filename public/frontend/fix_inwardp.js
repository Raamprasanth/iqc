const fs = require('fs');
let content = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/inwardp.html', 'utf-8');

// Exact pattern from the debug output (note: single space indent, not double)
const brokenStr = "                                                 ${p.problemStage || '-'}\r\n                                                        oninput=\"calcReject(this, 'rej-${p._id}')\" \r\n                                                        style=\"width: 70px; padding: 4px; text-align: center; border: 1px solid var(--fog); border-radius: 4px;\" />\r\n                                                </td>";

console.log('Searching for broken string...');
if (content.includes(brokenStr)) {
    const fixedStr = "                                                     ${p.problemStage || '-'}\r\n                                                 </td>\r\n                                                 <td style=\"padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:left; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\" title=\"${p.remarks || ''}\">\r\n                                                     ${p.remarks || '-'}\r\n                                                 </td>\r\n                                                 <td style=\"padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;\">\r\n                                                     <button onclick=\"openHistory('${p.grnNo}')\" style=\"background:#0284c7; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;\">View History</button>\r\n                                                 </td>\r\n                                                 <td style=\"padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;\">\r\n                                                     <span class=\"status-pill accepted\" style=\"background:#e0f2fe; color:#0284c7;\">Inspected</span>\r\n                                                 </td>\r\n                                             ` : `\r\n                                                 <td style=\"padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;\">\r\n                                                     <input type=\"number\" min=\"0\" max=\"${qty}\" \r\n                                                         class=\"accept-input\" \r\n                                                         data-id=\"${p._id}\" \r\n                                                         data-total=\"${qty}\" \r\n                                                         data-model=\"${g.model}\"\r\n                                                         data-date=\"${g.date}\"\r\n                                                         data-partno=\"${p.partNo}\"\r\n                                                         data-partdesc=\"${p.partDescription}\"\r\n                                                         data-grn=\"${p.grnNo || ''}\"\r\n                                                         data-invoice=\"${g.invoiceNo || ''}\"\r\n                                                         oninput=\"calcReject(this, 'rej-${p._id}')\" \r\n                                                         style=\"width: 70px; padding: 4px; text-align: center; border: 1px solid var(--fog); border-radius: 4px;\" />\r\n                                                 </td>";
    
    content = content.replace(brokenStr, fixedStr);
    fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/inwardp.html', content);
    console.log('Fixed successfully!');
} else {
    // Try to find it by looking for the unique fragment
    const fragment = "oninput=\"calcReject(this, 'rej-${p._id}')\" \r\n                                                        style=\"width: 70px";
    const idx = content.indexOf(fragment);
    if (idx !== -1) {
        console.log('Found fragment at index', idx);
        console.log('Surrounding context:', JSON.stringify(content.substring(idx - 300, idx + 200)));
    } else {
        console.log('Fragment not found either.');
        // show lines 1400-1405
        const lines = content.split('\n');
        console.log('Lines 1400-1406:');
        lines.slice(1399, 1406).forEach((l, i) => console.log(1400+i+':', JSON.stringify(l)));
    }
}
