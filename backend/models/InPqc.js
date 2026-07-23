const mongoose = require('mongoose');

const InPqcSchema = new mongoose.Schema({
    batchNumber: {
        type: String,
        required: [true, 'Please add a batch number']
    },
    partName: {
        type: String,
        required: [true, 'Please add a part name']
    },
    workOrder: {
        type: String,
        required: [true, 'Please add a work order']
    },
    stage: {
        type: String,
        required: [true, 'Please add a stage']
    },
    quantitySubmitted: {
        type: Number,
        required: [true, 'Please add quantity submitted']
    },
    submittedBy: {
        type: String,
        required: [true, 'Please add who submitted this']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'On Hold'],
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

module.exports = mongoose.model('InPqc', InPqcSchema);
