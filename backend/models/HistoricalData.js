const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    location: { type: String, required: true },
    parameter: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('HistoricalData', historySchema);
