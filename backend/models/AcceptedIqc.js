const mongoose = require('mongoose');

const acceptedIQCSchema = new mongoose.Schema({
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
    historyOfComponents: { type: String, default: '' },
    isReInward: { type: Boolean, default: false },
    yetToAcceptQty: { type: Number, default: 0 },
    yetToAcceptUpdatedAt: { type: Date },
    yetToAcceptHistory: { type: [Object], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('AcceptedIQC', acceptedIQCSchema);
