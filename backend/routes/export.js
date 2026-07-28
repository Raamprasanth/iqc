const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const Inward = require('../models/Inward');
const Inwardp = require('../models/Inwardp');

const parseRemarks = (remarksStr) => {
    if (!remarksStr) return [];
    // Format: "Nature (SN: Serial) (Spare: SpareName): Qty, ..."
    const parts = remarksStr.split(', ');
    const results = [];
    parts.forEach(p => {
        const match = p.match(/(.+?) \(SN: (.*?)\) \(Spare: (.*?)\): (\d+)/);
        if (match) {
            results.push({
                nature: match[1].trim(),
                serial: match[2].trim(),
                spare: match[3].trim(),
                qty: parseInt(match[4], 10)
            });
        }
    });
    return results;
};

const generateExcel = async (ModelCollection, res, filenamePrefix) => {
    try {
        const records = await ModelCollection.find({}).sort({ date: -1 }).lean();
        
        const wb = xlsx.utils.book_new();

        // Data structures for summaries
        const skdPendings = []; // Model, Invoice, Date, Recv Qty, Problem Qty
        const pivotData = []; // Model, Spare, Qty
        const sparesPendings = []; // Model, Invoice, Date, Recv Qty, Problem Qty, Spare, Req Qty
        
        // Group by model for individual sheets
        const modelSheetsData = {};

        records.forEach(rec => {
            const dateStr = rec.date ? new Date(rec.date).toLocaleDateString() : '';
            const invoice = rec.invoiceNo || '';
            const model = rec.model || 'Unknown';
            const recvQty = rec.quantity || 0;
            const rejQty = rec.rejectedQty || 0;
            const partNo = rec.partNo || '';
            const partDesc = rec.partDescription || '';
            
            const remarksParsed = parseRemarks(rec.remarks);

            if (!modelSheetsData[model]) {
                modelSheetsData[model] = [];
            }

            // Summaries processing
            if (rejQty > 0) {
                skdPendings.push({
                    'Model': model,
                    'BLT Invoice No.': invoice,
                    'Received Date': dateStr,
                    'Received Qty': recvQty,
                    'Problem QTY': rejQty
                });
            }

            if (remarksParsed.length === 0) {
                // No parsed remarks, just add the row if it's rejected
                if (rejQty > 0) {
                    modelSheetsData[model].push({
                        'Received Date': dateStr,
                        'BLT Invoice No.': invoice,
                        'Received Qty': recvQty,
                        'Total SKD kits cannot be make saleable': rejQty,
                        'P/N': partNo,
                        'Defective Item': partDesc,
                        'Problem Description': '',
                        'Spares required.': '',
                        'Failure Qty': rejQty,
                        'Serial No./Lot No.': ''
                    });
                }
            } else {
                // Has parsed remarks
                let problemDescArr = [];
                let sparesReqArr = [];
                let serialsArr = [];
                let totalReqQty = 0;

                remarksParsed.forEach(rm => {
                    problemDescArr.push(rm.nature);
                    sparesReqArr.push(`${rm.spare} - ${rm.qty} Nos`);
                    if (rm.serial && rm.serial !== 'NA') serialsArr.push(rm.serial);
                    totalReqQty += rm.qty;

                    pivotData.push({
                        'Model2': model,
                        'Spares required': rm.spare,
                        'Total': rm.qty
                    });

                    sparesPendings.push({
                        'Model': model,
                        'BLT Invoice No.': invoice,
                        'Received Date': dateStr,
                        'Received Qty': recvQty,
                        'Problem QTY': rejQty,
                        'Spares required': rm.spare,
                        'Req QTY': rm.qty
                    });
                });

                modelSheetsData[model].push({
                    'Received Date': dateStr,
                    'BLT Invoice No.': invoice,
                    'Received Qty': recvQty,
                    'Total SKD kits cannot be make saleable': rejQty,
                    'P/N': partNo,
                    'Defective Item': partDesc,
                    'Problem Description': problemDescArr.join('\n'),
                    'Spares required.': sparesReqArr.join('\n'),
                    'Failure Qty': totalReqQty,
                    'Serial No./Lot No.': serialsArr.join('\n')
                });
            }
        });

        // 1. Summary of SKD Kits Pendings
        if (skdPendings.length > 0) {
            const wsSKD = xlsx.utils.json_to_sheet(skdPendings);
            xlsx.utils.book_append_sheet(wb, wsSKD, 'Summary of SKD Kits Pendings');
        }

        // 2. PIVOT
        if (pivotData.length > 0) {
            // Group by Model and Spare
            const pivotMap = {};
            pivotData.forEach(p => {
                const key = p.Model2 + '|' + p['Spares required'];
                if (!pivotMap[key]) {
                    pivotMap[key] = { Model2: p.Model2, 'Spares required': p['Spares required'], Total: 0 };
                }
                pivotMap[key].Total += p.Total;
            });
            const wsPivot = xlsx.utils.json_to_sheet(Object.values(pivotMap));
            xlsx.utils.book_append_sheet(wb, wsPivot, 'PIVOT');
        }

        // 3. Summary Spares pendings
        if (sparesPendings.length > 0) {
            const wsSpares = xlsx.utils.json_to_sheet(sparesPendings);
            xlsx.utils.book_append_sheet(wb, wsSpares, 'Summary Spares pendings');
        }

        // 4. Model specific sheets
        for (const [modelName, data] of Object.entries(modelSheetsData)) {
            if (data.length > 0) {
                const safeName = (modelName + ' SKD Issues').substring(0, 31).replace(/[\\/?*\[\]]/g, ' ');
                const ws = xlsx.utils.json_to_sheet(data);
                xlsx.utils.book_append_sheet(wb, ws, safeName);
            }
        }

        // Output to buffer
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="${filenamePrefix}_Export.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating export');
    }
};

router.get('/inward', async (req, res) => {
    await generateExcel(Inward, res, 'IQC_Inward');
});

router.get('/inwardp', async (req, res) => {
    await generateExcel(Inwardp, res, 'Production_Inward');
});

module.exports = router;
