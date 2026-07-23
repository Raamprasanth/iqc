const fs = require('fs');
let html = fs.readFileSync('public/frontend/firstrep.html', 'utf8');

// The file had:
//                 dataSets.rejected.pro = rejectedPro;
//                 dataSets.rejected.ip = rejectedIp;

// We need to restore lines 1032-1044 above it.

html = html.replace('                dataSets.rejected.pro = rejectedPro;', `                    rejectedPro,
                    rejectedIp
                ] = await Promise.all([
                    fetch('/api/inward').then(r => r.ok ? r.json() : []),
                    fetch('/api/accepted-iqc').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejected-iqc').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejectedpro').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejectedip').then(r => r.ok ? r.json() : [])
                ]);

                inwardList = inwardItems;
                dataSets.accepted.iqc = acceptedIqc;
                dataSets.rejected.iqc = rejectedIqc;
                dataSets.rejected.pro = rejectedPro;`);

fs.writeFileSync('public/frontend/firstrep.html', html);
