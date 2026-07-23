const mongoose = require('mongoose');

const InwardipSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
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
    acceptedQty: { type: Number, default: 0 },
    rejectedQty: { type: Number, default: 0 },
    workOrder: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Inwardip', InwardipSchema);
