const express = require('express');
const router = express.Router();
const ReInwardIp = require('../models/ReInwardIp');
const Rejectedip = require('../models/Rejectedip');
const Acceptedip = require('../models/Acceptedip');

// GET all pending In-Process QC re-inward items
router.get('/', async (req, res) => {
    try {
        const pending = await ReInwardIp.find({ status: 'Pending' }).lean();
        res.json(pending);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch In-Process QC re-inward items' });
    }
});

// POST to send rejected In-Process QC items to Re-Inward
router.post('/send', async (req, res) => {
    try {
        const { items } = req.body; // Array of { id }
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'items array is required' });
        }

        const promises = [];
        for (const item of items) {
            const { id } = item;
            
            // Fetch original Rejectedip item
            const rejItem = await Rejectedip.findById(id);
            if (!rejItem) continue;

            // Set sentToReInward flag on the original document
            rejItem.sentToReInward = true;
            promises.push(rejItem.save());

            // Check if ReInwardIp document already exists
            const existing = await ReInwardIp.findOne({ originalRejectionId: id });
            if (!existing) {
                promises.push(new ReInwardIp({
                    originalRejectionId: id,
                    date: rejItem.date,
                    model: rejItem.model,
                    partNo: rejItem.partNo,
                    partDescription: rejItem.partDescription,
                    quantity: rejItem.quantity,
                    totalQuantity: rejItem.totalQuantity,
                    workOrder: rejItem.workOrder,
                    reason: rejItem.reason,
                    status: 'Pending'
                }).save());
            }
        }

        await Promise.all(promises);
        res.json({ success: true, message: 'Successfully sent items to In-Process QC Re-Inward' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send items to In-Process QC Re-Inward' });
    }
});

// POST save inspection for In-Process QC re-inward items
router.post('/inspect', async (req, res) => {
    try {
        const { inspections } = req.body;
        if (!inspections || !Array.isArray(inspections)) {
            return res.status(400).json({ error: 'Inspections array is required' });
        }

        const promises = [];
        const newWorkOrder = Date.now().toString();

        for (const item of inspections) {
            const { id, acceptedQty, rejectedQty, reason } = item;

            // 1. Fetch ReInwardIp document
            const reInwardItem = await ReInwardIp.findById(id);
            if (!reInwardItem) continue;

            reInwardItem.status = 'Inspected';
            reInwardItem.acceptedQty = acceptedQty;
            reInwardItem.rejectedQty = rejectedQty;
            promises.push(reInwardItem.save());

            // 2. Mark original rejected record as reInwarded
            promises.push(Rejectedip.findByIdAndUpdate(reInwardItem.originalRejectionId, { 
                reInwarded: true, 
                status: 'Re-inwarded' 
            }));

            // 3. Process Accepted Quantities
            if (acceptedQty > 0) {
                promises.push(new Acceptedip({
                    date: new Date(),
                    model: reInwardItem.model,
                    partNo: reInwardItem.partNo,
                    partDescription: reInwardItem.partDescription,
                    quantity: acceptedQty,
                    totalQuantity: acceptedQty + rejectedQty,
                    workOrder: reInwardItem.workOrder || newWorkOrder
                }).save());
            }

            // 4. Process Rejected Quantities
            if (rejectedQty > 0) {
                promises.push(new Rejectedip({
                    date: new Date(),
                    model: reInwardItem.model,
                    partNo: reInwardItem.partNo,
                    partDescription: reInwardItem.partDescription,
                    quantity: rejectedQty,
                    totalQuantity: acceptedQty + rejectedQty,
                    workOrder: reInwardItem.workOrder || newWorkOrder,
                    reason: reason || 'Re-rejected in In-Process Re-Inward'
                }).save());
            }
        }

        await Promise.all(promises);
        res.json({ success: true, message: 'In-Process QC re-inward inspection saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save In-Process QC re-inward inspection' });
    }
});

module.exports = router;
