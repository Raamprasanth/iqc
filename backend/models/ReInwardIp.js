const mongoose = require('mongoose');

const ReInwardIpSchema = new mongoose.Schema({
    originalRejectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rejectedip',
        required: true
    },
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
    workOrder: {
        type: String
    },
    reason: { 
        type: String 
    },
    status: {
        type: String,
        default: 'Pending' // 'Pending', 'Inspected'
    },
    acceptedQty: {
        type: Number,
        default: 0
    },
    rejectedQty: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ReInwardIp', ReInwardIpSchema);
