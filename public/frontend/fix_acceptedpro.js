const fs = require('fs');
let content = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/acceptedpro.html', 'utf-8');

// The broken block is from "// Fetch dynamic count for sidebar badge "Inward from IQC""
// to just before "function updateKPIs()"
// Let's replace the entire broken section with the correct functions.

const brokenStart = '        // Fetch dynamic count for sidebar badge "Inward from IQC"\n        async function fetchInwardpCount() {\n            try {\n            });\n            return Object.values(groups);\n        }';

const fixed = `        // Fetch dynamic count for sidebar badge "Inward from IQC"
        async function fetchInwardpCount() {
            try {
                const res = await fetch('/api/inwardp');
                if (res.ok) {
                    const data = await res.json();
                    const badge = document.getElementById('productionInwardBadge');
                    if (badge) badge.textContent = data.length;
                }
            } catch (err) {
                console.error('Error fetching production inward count:', err);
            }
        }

        async function fetchReInwardCount() {
            try {
                const res = await fetch('/api/reinwardpro');
                if (res.ok) {
                    const data = await res.json();
                    const badge = document.getElementById('productionReInwardBadge');
                    if (badge) badge.textContent = data.length;
                }
            } catch (err) {
                console.error('Error fetching reinward count:', err);
            }
        }

        async function fetchRejectedproCount() {
            try {
                const res = await fetch('/api/rejectedpro');
                if (res.ok) {
                    const data = await res.json();
                    const badge = document.getElementById('productionRejectedBadge');
                    if (badge) badge.textContent = data.length;
                }
            } catch (err) {
                console.error('Error fetching rejected pro count:', err);
            }
        }

        function groupEntries(data) {
            const groups = {};
            data.forEach(e => {
                const d = e.date ? e.date.split('T')[0] : '';
                const key = (e.invoiceNo && e.invoiceNo !== '-') ? e.invoiceNo : (e.batchId ? e.batchId : (d + '|' + e.model));
                if (!groups[key]) {
                    groups[key] = { date: d, invoiceNo: e.invoiceNo || '-', model: e.model, parts: [], totalQty: 0, ids: [] };
                }
                groups[key].parts.push(e);
                groups[key].totalQty += Number(e.totalQuantity || e.quantity || e.qty || 0);
                groups[key].ids.push(e._id);
            });
            return Object.values(groups);
        }`;

if (content.includes(brokenStart)) {
    content = content.replace(brokenStart, fixed);
    fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/acceptedpro.html', content);
    console.log('Fixed successfully');
} else {
    console.log('Pattern not found, trying alternate...');
    // Try with \r\n
    const brokenStart2 = '        // Fetch dynamic count for sidebar badge "Inward from IQC"\r\n        async function fetchInwardpCount() {\r\n            try {\r\n            });\r\n            return Object.values(groups);\r\n        }';
    if (content.includes(brokenStart2)) {
        content = content.replace(brokenStart2, fixed);
        fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/acceptedpro.html', content);
        console.log('Fixed successfully (CRLF)');
    } else {
        // show around the broken area to help diagnose
        const idx = content.indexOf('fetchInwardpCount');
        console.log('Context around fetchInwardpCount:');
        console.log(JSON.stringify(content.substring(idx - 10, idx + 300)));
    }
}
