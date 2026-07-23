const mongoose = require('mongoose');

const AcceptedipSchema = new mongoose.Schema({
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
        default: 'Passed' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Acceptedip', AcceptedipSchema);
