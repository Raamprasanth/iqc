const mongoose = require('mongoose');

const IqcSchema = new mongoose.Schema({
    partName: {
        type: String,
        required: [true, 'Please add a part name']
    },
    lotNumber: {
        type: String,
        required: [true, 'Please add a lot number']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    inspectorName: {
        type: String
    },
    remarks: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Iqc', IqcSchema);
