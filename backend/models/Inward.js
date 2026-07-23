const mongoose = require('mongoose');

const InwardSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    invoiceNo: {
        type: String,
        trim: true,
        default: ''
    },
    invoiceDate: {
        type: Date
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    partNo: {
        type: String,
        required: true,
        trim: true
    },
    partDescription: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['Pending', 'Passed', 'Rejected', 'On Hold', 'Inspected'],
        default: 'Pending'
    },
    inspected: { type: Boolean, default: false },
    remarks: { type: String, default: '' },
    historyOfComponents: { type: String, default: '' },
    acceptedQty: { type: Number, default: 0 },
    rejectedQty: { type: Number, default: 0 },
    grnNo: {
        type: String,
        default: function() {
            return 'GRN-' + Math.floor(10000 + Math.random() * 90000);
        }
    }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Inward', InwardSchema);
