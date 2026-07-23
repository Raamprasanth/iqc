const mongoose = require('mongoose');

const RejectedipSchema = new mongoose.Schema({
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Rejectedip', RejectedipSchema);
