const mongoose = require('mongoose');

const AcceptedproSchema = new mongoose.Schema({
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
        default: 'Accepted' 
    },
    problemStage: {
        type: String,
        default: ''
    },
    yetToAcceptQty: { type: Number, default: 0 },
    yetToAcceptUpdatedAt: { type: Date },
    yetToAcceptHistory: { type: [Object], default: [] }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Acceptedpro', AcceptedproSchema);
