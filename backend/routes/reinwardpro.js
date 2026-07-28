const express = require('express');
const router = express.Router();
const ReInwardPro = require('../models/ReInwardPro');
const Rejectedpro = require('../models/Rejectedpro');
const Acceptedpro = require('../models/Acceptedpro');
const Inwardip = require('../models/Inwardip');

// GET all pending Production re-inward items
router.get('/', async (req, res) => {
    try {
        const pending = await ReInwardPro.find({ status: 'Pending' }).lean();
        res.json(pending);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch Production re-inward items' });
    }
});

// POST to send rejected Production items to Re-Inward
router.post('/send', async (req, res) => {
    try {
        const { items } = req.body; // Array of { id }
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'items array is required' });
        }

        const promises = [];
        for (const item of items) {
            const { id } = item;
            
            // Fetch the original Rejectedpro item
            const rejItem = await Rejectedpro.findById(id);
            if (!rejItem) continue;

            // Set sentToReInward flag on the original document
            rejItem.sentToReInward = true;
            promises.push(rejItem.save());

            // Check if ReInwardPro document already exists
            const existing = await ReInwardPro.findOne({ originalRejectionId: id });
            if (!existing) {
                promises.push(new ReInwardPro({
                    originalRejectionId: id,
                    date: rejItem.date,
                    model: rejItem.model,
                    partNo: rejItem.partNo,
                    partDescription: rejItem.partDescription,
                    quantity: rejItem.quantity,
                    totalQuantity: rejItem.totalQuantity,
                    batchId: rejItem.batchId,
                    reason: rejItem.reason,
                    status: 'Pending'
                }).save());
            }
        }

        await Promise.all(promises);
        res.json({ success: true, message: 'Successfully sent items to Production Re-Inward' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send items to Production Re-Inward' });
    }
});

// POST save inspection for Production re-inward items
router.post('/inspect', async (req, res) => {
    try {
        const { inspections } = req.body;
        if (!inspections || !Array.isArray(inspections)) {
            return res.status(400).json({ error: 'Inspections array is required' });
        }

        const promises = [];
        const newBatchId = Date.now().toString();

        for (const item of inspections) {
            const { id, acceptedQty, rejectedQty, reason } = item;

            // 1. Fetch ReInwardPro document
            const reInwardItem = await ReInwardPro.findById(id);
            if (!reInwardItem) continue;

            reInwardItem.status = 'Inspected';
            reInwardItem.acceptedQty = acceptedQty;
            reInwardItem.rejectedQty = rejectedQty;
            promises.push(reInwardItem.save());

            // 2. Mark original rejected record as reInwarded
            promises.push(Rejectedpro.findByIdAndUpdate(reInwardItem.originalRejectionId, { 
                reInwarded: true, 
                status: 'Re-inwarded' 
            }));

            // 3. Process Accepted Quantities
            if (acceptedQty > 0) {
                // Production Accepted
                promises.push(new Acceptedpro({
                    date: new Date(),
                    model: reInwardItem.model,
                    partNo: reInwardItem.partNo,
                    partDescription: reInwardItem.partDescription,
                    quantity: acceptedQty,
                    totalQuantity: acceptedQty + rejectedQty,
                    batchId: newBatchId
                }).save());

                // Inward for In-Process QC (using batchId as workOrder since shop floor starts here)
                promises.push(new Inwardip({
                    date: new Date(),
                    model: reInwardItem.model,
                    partNo: reInwardItem.partNo,
                    partDescription: reInwardItem.partDescription,
                    quantity: acceptedQty,
                    workOrder: reInwardItem.batchId || newBatchId
                }).save());
            }

            // 4. Process Rejected Quantities
            if (rejectedQty > 0) {
                promises.push(new Rejectedpro({
                    date: new Date(),
                    model: reInwardItem.model,
                    partNo: reInwardItem.partNo,
                    partDescription: reInwardItem.partDescription,
                    quantity: rejectedQty,
                    totalQuantity: acceptedQty + rejectedQty,
                    batchId: newBatchId,
                    reason: reason || 'Re-rejected in Production Re-Inward'
                }).save());
            }
        }

        await Promise.all(promises);
        res.json({ success: true, message: 'Production re-inward inspection saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save Production re-inward inspection' });
    }
});

// POST to mark an accepted invoice group as Completed and move to reinwardpro
router.post('/complete', async (req, res) => {
    try {
        const { ids } = req.body; // Array of Acceptedpro _ids for the invoice group
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids array is required' });
        }

        // Fetch all Acceptedpro records in the group
        const records = await Acceptedpro.find({ _id: { $in: ids } }).lean();
        if (!records.length) {
            return res.status(404).json({ error: 'No records found for given ids' });
        }

        const Rejectedpro = require('../models/Rejectedpro');
        const invoiceNos = [...new Set(records.map(r => r.invoiceNo).filter(Boolean))];
        const models = [...new Set(records.map(r => r.model).filter(Boolean))];
        const batchIds = [...new Set(records.map(r => r.batchId).filter(Boolean))];

        const rejectedRecords = await Rejectedpro.find({
            $or: [
                { invoiceNo: { $in: invoiceNos } },
                { batchId: { $in: batchIds } },
                { model: { $in: models } }
            ]
        }).lean();

        // Verify if any part in this invoice group still has unreplaced/pending items
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
        const reInwardDocs = records.map(r => ({
            originalRejectionId: r._id,
            date: r.date,
            model: r.model,
            partNo: r.partNo,
            partDescription: r.partDescription,
            quantity: r.quantity,
            totalQuantity: r.totalQuantity,
            batchId: batchId,
            invoiceNo: r.invoiceNo,
            reason: 'Completed from Accepted',
            status: 'Pending'
        }));

        // Insert ReInwardPro records
        await ReInwardPro.insertMany(reInwardDocs);

        // Mark originals as completed so they are hidden from acceptedpro page
        await Acceptedpro.updateMany({ _id: { $in: ids } }, { $set: { status: 'Completed', yetToAcceptQty: 0 } });

        res.json({ success: true, message: 'Invoice moved to Completed (Re-Inward Pro).' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to complete invoice entry' });
    }
});

module.exports = router;

