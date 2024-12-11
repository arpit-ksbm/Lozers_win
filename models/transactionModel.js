const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    transaction_id: { type: String, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true }, // Transaction type
    amount: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed", "pending"], required: true },
    description: { type: String }, // Description of the transaction
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
