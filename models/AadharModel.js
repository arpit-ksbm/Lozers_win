const mongoose = require('mongoose');
const { Schema } = mongoose;

const aadharSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    aadhaar_number: {
        type: String,
        required: true,
    },
    reference_id: {
        type: String,
        // required: true,
    },
    status: {
        enum: ['verified','not_verified']
    }
    
}, { timestamps: true });

aadharSchema.index({ userId: 1, aadhaar_number: 1 }, { unique: true });

module.exports = mongoose.model('Aadhar', aadharSchema);
