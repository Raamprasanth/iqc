const mongoose = require('mongoose');

const RejectedproSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        default: Date.now 
    },
    model: { 
        type: String, 
        required: true 
    },
    partNo: { 
        type: String, 
        required: true 
    },
    partDescription: { 
        type: String 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    totalQuantity: { 
        type: Number 
    },
    batchId: {
        type: String
    },
    invoiceNo: {
        type: String
    },
    remarks: {
        type: String
    },
    status: { 
        type: String, 
        default: 'Rejected' 
    },
    reason: { 
        type: String 
    },
    reInwarded: {
        type: Boolean,
        default: false
    },
    sentToReInward: {
        type: Boolean,
        default: false
    },
    problemStage: {
        type: String,
        default: ''
    },
    remarks: { type: String, default: '' },
    repSerialNo: { type: String, default: '' },
    additionalRemarks: { type: String, default: '' },
    isReplaced: { type: Boolean, default: false },
    itemDetails: { type: [Object], default: [] },
    source: { type: String, default: '' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Rejectedpro', RejectedproSchema);
