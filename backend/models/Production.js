const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
    grnNo: {
        type: String,
        required: [true, 'Please add a GRN number']
    },
    lotNo: {
        type: String,
        required: [true, 'Please add a lot number']
    },
    partName: {
        type: String,
        required: [true, 'Please add a part name']
    },
    partNo: {
        type: String
    },
    workOrder: {
        type: String
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity']
    },
    line: {
        type: String
    },
    receivedBy: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending Acceptance', 'Accepted', 'Rejected'],
        default: 'Pending Acceptance'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Production', ProductionSchema);
