const mongoose = require('mongoose');

const spareSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true,
        trim: true
    },
    partDescription: {
        type: String,
        required: true,
        trim: true
    },
    subParts: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Spare', spareSchema);
