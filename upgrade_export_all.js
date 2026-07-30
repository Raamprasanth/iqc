const fs = require('fs');

/**
 * Builds an array of row-arrays for a single invoice group,
 * matching exactly the columns in downloadInvoiceExcel.
 */
function buildInvoiceRows(g) {
    const rows = [
        ['Inward Date', 'Invoice Date', 'Invoice NO', 'Inward Qty', 'Part No', 'Defective Items', 'Problem Description', 'Spares Required', 'Required Qty', 'Serial No / Lot No', 'Rep Serial No', 'Rep Invoice No', 'Rep Invoice Date']
    ];

    g.parts.forEach(p => {
        const inwardQty = Number(p.totalQuantity || p.receivedQty || p.quantity || p.qty || 0);
        if (p.itemDetails && p.itemDetails.length > 0) {
            p.itemDetails.forEach(item => {
                if (!item.isReplaced) {
                    const repRows = getRepRows(item);
                    repRows.forEach(r => {
                        rows.push([
                            formatDateDisplay(g.date),
                            formatDateDisplay(g.invoiceDate || p.invoiceDate || ''),
                            g.invoiceNo || p.invoiceNo || '',
                            inwardQty,
                            p.partNo || '',
                            p.partDescription || '',
                            item.nature || '',
                            item.spare || '',
                            item.qty || 1,
                            item.serial || '',
                            r.repSerialNo || '',
                            r.repInvoiceNo || '',
                            r.repInvoiceDate ? formatDateDisplay(r.repInvoiceDate) : ''
                        ]);
                    });
                }
            });
        } else {
            rows.push([
                formatDateDisplay(g.date),
                formatDateDisplay(g.invoiceDate || p.invoiceDate || ''),
                g.invoiceNo || p.invoiceNo || '',
                inwardQty,
                p.partNo || '',
                p.partDescription || '',
                p.remarks || p.reason || '',
                '',
                Number(p.quantity || p.qty || 0),
                '',
                p.repSerialNo || '',
                p.repInvoiceNo || '',
                p.repInvoiceDate ? formatDateDisplay(p.repInvoiceDate) : ''
            ]);
        }
    });

    return rows;
}

// ─── SheetJS CDN snippet to inject ─────────────────────────────────────────
const SHEETJS_SCRIPT = `<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>`;

// ─── New Export-All JS for rejectediqc ─────────────────────────────────────
const IQC_EXPORT_ALL_NEW = `
        /* ── Export All Excel (multi-sheet) ── */
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const grouped = groupEntries(entries);
                if (!grouped.length) return;

                const wb = XLSX.utils.book_new();

                grouped.forEach((g, i) => {
                    const rows = [
                        ['Inward Date', 'Invoice Date', 'Invoice NO', 'Inward Qty', 'Part No', 'Defective Items', 'Problem Description', 'Spares Required', 'Required Qty', 'Serial No / Lot No', 'Rep Serial No', 'Rep Invoice No', 'Rep Invoice Date']
                    ];

                    g.parts.forEach(p => {
                        const inwardQty = Number(p.totalQuantity || p.receivedQty || p.quantity || p.qty || 0);
                        if (p.itemDetails && p.itemDetails.length > 0) {
                            p.itemDetails.forEach(item => {
                                if (!item.isReplaced) {
                                    const repRows = getRepRows(item);
                                    repRows.forEach(r => {
                                        rows.push([
                                            formatDateDisplay(g.date),
                                            formatDateDisplay(g.invoiceDate || p.invoiceDate || ''),
                                            g.invoiceNo || p.invoiceNo || '',
                                            inwardQty,
                                            p.partNo || '',
                                            p.partDescription || '',
                                            item.nature || '',
                                            item.spare || '',
                                            item.qty || 1,
                                            item.serial || '',
                                            r.repSerialNo || '',
                                            r.repInvoiceNo || '',
                                            r.repInvoiceDate ? formatDateDisplay(r.repInvoiceDate) : ''
                                        ]);
                                    });
                                }
                            });
                        } else {
                            rows.push([
                                formatDateDisplay(g.date),
                                formatDateDisplay(g.invoiceDate || p.invoiceDate || ''),
                                g.invoiceNo || p.invoiceNo || '',
                                inwardQty,
                                p.partNo || '',
                                p.partDescription || '',
                                p.remarks || p.reason || '',
                                '',
                                Number(p.quantity || p.qty || 0),
                                '',
                                p.repSerialNo || '',
                                p.repInvoiceNo || '',
                                p.repInvoiceDate ? formatDateDisplay(p.repInvoiceDate) : ''
                            ]);
                        }
                    });

                    const ws = XLSX.utils.aoa_to_sheet(rows);
                    const rawInv = g.invoiceNo && g.invoiceNo !== '-' ? g.invoiceNo : ('Invoice_' + (i + 1));
                    const sheetName = rawInv.replace(/[\\\\/:*?\\[\\]]/g, '_').substring(0, 31);
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                });

                XLSX.writeFile(wb, 'Rejected_IQC_' + new Date().toISOString().split('T')[0] + '.xlsx');
            });
        }`;

// ─── New Export-All JS for rejectedpro ─────────────────────────────────────
const PRO_EXPORT_ALL_NEW = `
        /* ── Export All Excel (multi-sheet) ── */
        document.getElementById('exportBtn').addEventListener('click', () => {
            const grouped = groupEntries(entries);
            if (!grouped.length) return;

            const wb = XLSX.utils.book_new();

            grouped.forEach((g, i) => {
                const rows = [
                    ['Inward Date', 'Invoice Date', 'Invoice NO', 'Inward Qty', 'Part No', 'Defective Items', 'Problem Description', 'Spares Required', 'Required Qty', 'Serial No / Lot No', 'Rep Serial No', 'Rep Invoice No', 'Rep Invoice Date']
                ];

                g.parts.forEach(p => {
                    const inwardQty = Number(p.totalQuantity || p.receivedQty || p.quantity || p.qty || 0);
                    if (p.itemDetails && p.itemDetails.length > 0) {
                        p.itemDetails.forEach(item => {
                            if (!item.isReplaced) {
                                const repRows = getRepRows(item);
                                repRows.forEach(r => {
                                    rows.push([
                                        formatDateDisplay(g.date),
                                        formatDateDisplay(g.invoiceDate || p.invoiceDate || ''),
                                        g.invoiceNo || p.invoiceNo || '',
                                        inwardQty,
                                        p.partNo || '',
                                        p.partDescription || '',
                                        item.nature || '',
                                        item.spare || '',
                                        item.qty || 1,
                                        item.serial || '',
                                        r.repSerialNo || '',
                                        r.repInvoiceNo || '',
                                        r.repInvoiceDate ? formatDateDisplay(r.repInvoiceDate) : ''
                                    ]);
                                });
                            }
                        });
                    } else {
                        rows.push([
                            formatDateDisplay(g.date),
                            formatDateDisplay(g.invoiceDate || p.invoiceDate || ''),
                            g.invoiceNo || p.invoiceNo || '',
                            inwardQty,
                            p.partNo || '',
                            p.partDescription || '',
                            p.remarks || p.reason || '',
                            '',
                            Number(p.quantity || p.qty || 0),
                            '',
                            p.repSerialNo || '',
                            p.repInvoiceNo || '',
                            p.repInvoiceDate ? formatDateDisplay(p.repInvoiceDate) : ''
                        ]);
                    }
                });

                const ws = XLSX.utils.aoa_to_sheet(rows);
                const rawInv = g.invoiceNo && g.invoiceNo !== '-' ? g.invoiceNo : ('Invoice_' + (i + 1));
                const sheetName = rawInv.replace(/[\\\\/:*?\\[\\]]/g, '_').substring(0, 31);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            });

            XLSX.writeFile(wb, 'Rejected_Production_' + new Date().toISOString().split('T')[0] + '.xlsx');
        });`;

// ─── Process rejectediqc.html ────────────────────────────────────────────────
let iqcContent = fs.readFileSync('public/frontend/rejectediqc.html', 'utf8');

// 1. Add SheetJS CDN before </head>
iqcContent = iqcContent.replace('</head>', SHEETJS_SCRIPT + '\n</head>');

// 2. Replace the old export-all block
//    It starts at: const exportBtn = document.getElementById('exportBtn');
//    It ends at:   });  (closing the event listener)  — we'll match precisely
const IQC_OLD_EXPORT = /\/\* ── Overall Export ── \*\/\s*const exportBtn[\s\S]*?a\.click\(\);\s*\}\);\s*\}/;
iqcContent = iqcContent.replace(IQC_OLD_EXPORT, IQC_EXPORT_ALL_NEW.trim());

fs.writeFileSync('public/frontend/rejectediqc.html', iqcContent);
console.log('✅ Updated rejectediqc.html');

// ─── Process rejectedpro.html ────────────────────────────────────────────────
let proContent = fs.readFileSync('public/frontend/rejectedpro.html', 'utf8');

// 1. Add SheetJS CDN before </head>
proContent = proContent.replace('</head>', SHEETJS_SCRIPT + '\n</head>');

// 2. Replace the old export-all block
const PRO_OLD_EXPORT = /\/\* ── Export ── \*\/\s*document\.getElementById\('exportBtn'\)[\s\S]*?a\.click\(\);\s*\}\);/;
proContent = proContent.replace(PRO_OLD_EXPORT, PRO_EXPORT_ALL_NEW.trim());

fs.writeFileSync('public/frontend/rejectedpro.html', proContent);
console.log('✅ Updated rejectedpro.html');
