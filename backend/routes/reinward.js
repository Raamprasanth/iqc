const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RejectedIQC = require('../models/RejectedIqc');
const Rejectedpro = require('../models/Rejectedpro');
const Rejectedip = require('../models/Rejectedip');
const AcceptedIqc = require('../models/AcceptedIqc');
const ReInwardPro = require('../models/ReInwardPro');
const Inwardp = require('../models/Inwardp');
const Acceptedpro = require('../models/Acceptedpro');
const Inwardip = require('../models/Inwardip');
const Acceptedip = require('../models/Acceptedip');

// GET all re-inward items (rejected items from all 3 stages where sentToReInward is true and reInwarded is not true)
router.get('/', async (req, res) => {
    try {
        const [iqcRejections, proRejections, ipRejections] = await Promise.all([
            RejectedIQC.find({ sentToReInward: true, reInwarded: { $ne: true } }).lean(),
            Rejectedpro.find({ sentToReInward: true, reInwarded: { $ne: true } }).lean(),
            Rejectedip.find({ sentToReInward: true, reInwarded: { $ne: true } }).lean()
        ]);

        const mappedIqc = iqcRejections.map(item => ({ ...item, stage: 'IQC' }));
        const mappedPro = proRejections.map(item => ({ ...item, stage: 'Production' }));
        const mappedIp = ipRejections.map(item => ({ ...item, stage: 'In-Process QC' }));

        const combined = [...mappedIqc, ...mappedPro, ...mappedIp].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        res.json(combined);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch re-inward items' });
    }
});

// POST to send rejected items to Re-Inward
router.post('/send', async (req, res) => {
    try {
        const { items } = req.body; // Array of { id, stage }
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'items array is required' });
        }

        const promises = [];
        for (const item of items) {
            const { id, stage, problemDescription, problemSerialNo, spareRequired, reqQty, problemStage, reportedDate } = item;
            
            const updateFields = { 
                sentToReInward: true,
                problemDescription: problemDescription || '',
                problemSerialNo: problemSerialNo || '',
                spareRequired: spareRequired || '',
                reqQty: reqQty || '',
                problemStage: problemStage || '',
                reportedDate: reportedDate || ''
            };

            if (stage === 'IQC') {
                promises.push(RejectedIQC.findByIdAndUpdate(id, updateFields));
            } else if (stage === 'Production') {
                promises.push(Rejectedpro.findByIdAndUpdate(id, updateFields));
            } else if (stage === 'In-Process QC') {
                promises.push(Rejectedip.findByIdAndUpdate(id, updateFields));
            }
        }

        await Promise.all(promises);
        res.json({ success: true, message: 'Successfully sent items to Re-Inward' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send items to Re-Inward' });
    }
});

// POST save inspection for re-inward items
router.post('/inspect', async (req, res) => {
    try {
        const { inspections } = req.body;
        if (!inspections || !Array.isArray(inspections)) {
            return res.status(400).json({ error: 'Inspections array is required' });
        }

        const promises = [];
        const newBatchId = Date.now().toString();

        for (const item of inspections) {
            const { id, stage, acceptedQty, rejectedQty, date, model, partNo, partDescription, grnNo, batchId, workOrder, reason, recvSerialNo, recvQty, remarks } = item;

            // 1. Mark original rejected record as reInwarded
            if (stage === 'IQC') {
                promises.push(RejectedIQC.findByIdAndUpdate(id, { 
                    reInwarded: true, 
                    status: 'Re-inwarded',
                    recvSerialNo: recvSerialNo || '',
                    recvQty: recvQty || 0,
                    remarks: remarks || ''
                }));
            } else if (stage === 'Production') {
                promises.push(Rejectedpro.findByIdAndUpdate(id, { 
                    reInwarded: true, 
                    status: 'Re-inwarded',
                    recvSerialNo: recvSerialNo || '',
                    recvQty: recvQty || 0,
                    remarks: remarks || ''
                }));
            } else if (stage === 'In-Process QC') {
                promises.push(Rejectedip.findByIdAndUpdate(id, { 
                    reInwarded: true, 
                    status: 'Re-inwarded',
                    recvSerialNo: recvSerialNo || '',
                    recvQty: recvQty || 0,
                    remarks: remarks || ''
                }));
            }

            // 2. Process Accepted Quantities
            if (acceptedQty > 0) {
                const baseData = {
                    date: date ? new Date(date) : new Date(),
                    model,
                    partNo,
                    partDescription,
                    quantity: acceptedQty,
                    totalQuantity: acceptedQty + rejectedQty,
                    batchId: newBatchId
                };

                if (stage === 'IQC') {
                    // Save accepted IQC re-inward entry (tagged isReInward: true)
                    promises.push(new AcceptedIqc({ ...baseData, isReInward: true }).save());
                    
                    // Route accepted qty to Production Re-Inward (via a linked Rejectedpro + ReInwardPro)
                    const preGeneratedId = new mongoose.Types.ObjectId();
                    
                    promises.push(new Rejectedpro({
                        _id: preGeneratedId,
                        date: baseData.date,
                        model: baseData.model,
                        partNo: baseData.partNo,
                        partDescription: baseData.partDescription,
                        quantity: acceptedQty,
                        totalQuantity: acceptedQty,
                        batchId: baseData.batchId || newBatchId,
                        reason: reason || 'Accepted in IQC Re-Inward – routed to Production Re-Inward',
                        sentToReInward: true
                    }).save());
                    
                    promises.push(new ReInwardPro({
                        originalRejectionId: preGeneratedId,
                        date: baseData.date,
                        model: baseData.model,
                        partNo: baseData.partNo,
                        partDescription: baseData.partDescription,
                        quantity: acceptedQty,
                        totalQuantity: acceptedQty,
                        batchId: baseData.batchId || newBatchId,
                        reason: reason || 'Accepted in IQC Re-Inward – routed to Production Re-Inward',
                        status: 'Pending'
                    }).save());
                } else if (stage === 'Production') {
                    promises.push(new Acceptedpro(baseData).save());
                    promises.push(new Inwardip({ ...baseData, grnNo }).save());
                } else if (stage === 'In-Process QC') {
                    promises.push(new Acceptedip({ ...baseData, workOrder }).save());
                }
            }

            // 3. Process Rejected Quantities
            if (rejectedQty > 0) {
                const baseData = {
                    date: date ? new Date(date) : new Date(),
                    model,
                    partNo,
                    partDescription,
                    quantity: rejectedQty,
                    totalQuantity: acceptedQty + rejectedQty,
                    batchId: newBatchId,
                    reason: reason || 'Re-rejected in Re-Inward'
                };

                if (stage === 'IQC') {
                    promises.push(new RejectedIQC({ ...baseData, isReInward: true }).save());
                } else if (stage === 'Production') {
                    promises.push(new Rejectedpro(baseData).save());
                } else if (stage === 'In-Process QC') {
                    promises.push(new Rejectedip({ ...baseData, workOrder }).save());
                }
            }
        }

        await Promise.all(promises);
        res.json({ success: true, message: 'Re-inward inspection saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save re-inward inspection' });
    }
});
// DELETE a re-inward entry
router.delete('/:stage/:id', async (req, res) => {
    try {
        const { stage, id } = req.params;
        let deleted;
        if (stage === 'IQC') deleted = await RejectedIQC.findByIdAndDelete(id);
        else if (stage === 'Production') deleted = await Rejectedpro.findByIdAndDelete(id);
        else if (stage === 'In-Process QC') deleted = await Rejectedip.findByIdAndDelete(id);
        
        if (deleted) res.json({ success: true, message: 'Deleted' });
        else res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST to mark an accepted IQC invoice group as Completed and move to Re-Inward
router.post('/complete', async (req, res) => {
    try {
        const { ids } = req.body; // Array of AcceptedIQC _ids for the invoice group
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids array is required' });
        }

        // Fetch all AcceptedIQC records
        const records = await AcceptedIqc.find({ _id: { $in: ids } }).lean();
        if (!records.length) {
            return res.status(404).json({ error: 'No records found for given ids' });
        }

        const RejectedIQC = require('../models/RejectedIqc');
        const invoiceNos = [...new Set(records.map(r => r.invoiceNo).filter(Boolean))];
        const models = [...new Set(records.map(r => r.model).filter(Boolean))];
        const batchIds = [...new Set(records.map(r => r.batchId).filter(Boolean))];

        const rejectedRecords = await RejectedIQC.find({
            $or: [
                { invoiceNo: { $in: invoiceNos } },
                { batchId: { $in: batchIds } },
                { model: { $in: models } }
            ]
        }).lean();

        let hasRemaining = false;
        for (const r of records) {
            const matchingRej = rejectedRecords.filter(rej => 
                ((rej.invoiceNo && r.invoiceNo && rej.invoiceNo === r.invoiceNo) ||
                 (rej.batchId && r.batchId && rej.batchId === r.batchId) ||
                 (rej.model === r.model)) &&
                rej.partNo === r.partNo
            );

            if (matchingRej.length > 0) {
                for (const rej of matchingRej) {
                    if (rej.itemDetails && rej.itemDetails.length > 0) {
                        const hasUnreplaced = rej.itemDetails.some(item => !item.isReplaced);
                        if (hasUnreplaced) {
                            hasRemaining = true;
                            break;
                        }
                    } else if (!rej.isReplaced) {
                        hasRemaining = true;
                        break;
                    }
                }
            } else if (Number(r.yetToAcceptQty || 0) > 0 && !r.isReplaced) {
                hasRemaining = true;
            }

            if (hasRemaining) break;
        }

        if (hasRemaining) {
            return res.status(400).json({ error: 'Cannot complete: some parts still have pending qty to accept.' });
        }

        const batchId = Date.now().toString();

        // Create RejectedIQC records with sentToReInward=true so they appear on the Re-Inward page
        const rejDocs = records.map(r => ({
            date: r.date,
            model: r.model,
            partNo: r.partNo,
            partDescription: r.partDescription,
            quantity: r.quantity,
            totalQuantity: r.totalQuantity,
            batchId: batchId,
            grnNo: r.grnNo || '',
            invoiceNo: r.invoiceNo || '',
            remarks: r.remarks || '',
            reason: 'Completed from Accepted IQC',
            sentToReInward: true,
            reInwarded: false,
            status: 'Pending'
        }));

        await RejectedIQC.insertMany(rejDocs);

        // Mark originals as Completed so they disappear from acceptediqc page
        await AcceptedIqc.updateMany({ _id: { $in: ids } }, { $set: { status: 'Completed', yetToAcceptQty: 0 } });

        res.json({ success: true, message: 'Invoice moved to Re-Inward register.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to complete invoice entry' });
    }
});

module.exports = router;

