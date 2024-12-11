const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending", 
        required: true 
    },
    request_date: { type: Date, default: Date.now },
    approved_date: { type: Date },
    rejection_reason: { type: String }, // Reason for rejection
});

module.exports = mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
