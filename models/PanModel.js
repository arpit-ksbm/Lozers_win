const mongoose = require('mongoose');

const panSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    pan: { type: String, required: true },
    name_as_per_pan: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    status: { type: String, enum: ['verified', 'not_verified'], default: 'not_verified' },
}, { timestamps: true });

// Create a compound index on userId and pan to ensure uniqueness
panSchema.index({ userId: 1, pan: 1 }, { unique: true });

const Pan = mongoose.model('Pan', panSchema);

module.exports = Pan;