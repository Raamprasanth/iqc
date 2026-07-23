const mongoose = require('mongoose');

const rejectedIQCSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    model: { type: String, required: true },
    partNo: { type: String, required: true },
    partDescription: { type: String },
    quantity: { type: Number, required: true },
    totalQuantity: { type: Number },
    batchId: { type: String },
    status: { type: String, default: 'Pending' },
    grnNo: { type: String },
    invoiceNo: { type: String, default: '' },
    remarks: { type: String, default: '' },
    repSerialNo: { type: String, default: '' },
    additionalRemarks: { type: String, default: '' },
    isReplaced: { type: Boolean, default: false },
    problemDescription: { type: String, default: '' },
    problemSerialNo: { type: String, default: '' },
    spareRequired: { type: String, default: '' },
    reqQty: { type: String, default: '' },
    problemStage: { type: String, default: '' },
    reportedDate: { type: String, default: '' },
    recvSerialNo: { type: String, default: '' },
    recvQty: { type: Number, default: 0 },
    historyOfComponents: { type: String, default: '' },
    reason: { type: String },
    reInwarded: { type: Boolean, default: false },
    sentToReInward: { type: Boolean, default: false },
    isReInward: { type: Boolean, default: false },
    itemDetails: { type: [Object], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('RejectedIQC', rejectedIQCSchema);
