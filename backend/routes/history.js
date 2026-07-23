const express = require('express');
const router = express.Router();

const Inward = require('../models/Inward');
const AcceptedIQC = require('../models/AcceptedIqc');
const RejectedIQC = require('../models/RejectedIqc');
const Inwardp = require('../models/Inwardp');
const Production = require('../models/Production'); // etc...

router.get('/:grnNo', async (req, res) => {
    try {
        const id = req.params.grnNo;
        const query = { $or: [{ grnNo: id }, { partNo: id }] };
        if (!id) return res.status(400).json({ error: 'GRN Number is required' });

        const history = [];

        // 1. Check Inward
        const inwardDocs = await Inward.find(query);
        inwardDocs.forEach(doc => {
            history.push({
                stage: 'Inward',
                status: doc.inspected ? 'Inspected' : 'Pending',
                date: doc.date || doc.createdAt,
                quantity: doc.quantity,
                remarks: '',
                desc: `Received ${doc.quantity} parts from dock.`
            });
        });

        // 2. Check Accepted IQC
        const acceptedIQC = await AcceptedIQC.find(query);
        acceptedIQC.forEach(doc => {
            history.push({
                stage: 'IQC (Accepted)',
                status: 'Accepted',
                date: doc.date || doc.createdAt,
                quantity: doc.quantity,
                remarks: doc.remarks,
                desc: `Accepted ${doc.quantity} parts in IQC.`
            });
        });

        // 3. Check Rejected IQC
        const rejectedIQC = await RejectedIQC.find(query);
        rejectedIQC.forEach(doc => {
            history.push({
                stage: 'IQC (Rejected)',
                status: 'Rejected',
                date: doc.date || doc.createdAt,
                quantity: doc.quantity,
                remarks: doc.remarks,
                desc: `Rejected ${doc.quantity} parts in IQC.`
            });
        });

        // 4. Check Inwardp (Production Inward)
        const inwardp = await Inwardp.find(query);
        inwardp.forEach(doc => {
            history.push({
                stage: 'Production Inward',
                status: doc.status || 'Moved to Production',
                date: doc.date || doc.createdAt,
                quantity: doc.quantity,
                remarks: doc.remarks,
                desc: `Moved ${doc.quantity} parts to Production.`
            });
        });

        // Sort by date (oldest first)
        history.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error fetching history' });
    }
});

module.exports = router;
