const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    partNo: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Part', partSchema);
