const fs = require('fs');
let html = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', 'utf8');

// Replace table header to include Invoice No
html = html.replace(
    '<th style="padding:16px 20px; font-weight:600; color:var(--navy); text-align:left; border-bottom:2px solid var(--fog); cursor:pointer;">Date</th>',
    '<th style="padding:16px 20px; font-weight:600; color:var(--navy); text-align:left; border-bottom:2px solid var(--fog); cursor:pointer;">Invoice No.</th>\n                                    <th style="padding:16px 20px; font-weight:600; color:var(--navy); text-align:left; border-bottom:2px solid var(--fog); cursor:pointer;">Date</th>'
);

// Update groupEntries to group by invoiceNo
html = html.replace(
    'const key = d + \'|\' + e.model;',
    'const key = e.invoiceNo || (d + \'|\' + e.model);'
);

html = html.replace(
    'groups[key] = { date: d, model: e.model, partsMap: {}, parts: [], inwardTotal: 0, iqcTotal: 0, proTotal: 0, ipqcTotal: 0, rejections: [] };',
    'groups[key] = { invoiceNo: e.invoiceNo || \'N/A\', date: d, model: e.model, partsMap: {}, parts: [], inwardTotal: 0, iqcTotal: 0, proTotal: 0, ipqcTotal: 0, rejections: [] };'
);

// Update the inner table rendering to include invoiceNo
html = html.replace(
    '<td><span class="cell-part">\</span></td>',
    '<td><span class="cell-part" style="font-weight: 700; color: var(--navy);">\</span></td>\n                    <td><span class="cell-part">\</span></td>'
);

// Add an extra td in the colspan for subrow
html = html.replace(
    '<td colspan="11"',
    '<td colspan="12"'
);

// Also add a td for the CSV export header
html = html.replace(
    '\'Sl.No.\', \\n                \'Date\',',
    '\'Sl.No.\', \'Invoice No.\', \'Date\','
);

// Inward list matching needs invoiceNo consideration
html = html.replace(
    'return inwD === lot.date && inw.model === lot.model && inw.partNo === part.partNo;',
    'return (inw.invoiceNo === lot.invoiceNo || (inwD === lot.date && inw.model === lot.model)) && inw.partNo === part.partNo;'
);

fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', html);
console.log('Modified firstrep.html to group by invoiceNo');
