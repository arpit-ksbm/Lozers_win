const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transactionType: {
        type: String,
        enum: ['Deposit', 'Withdrawal'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Success', 'Failed', 'Pending'],
        default: 'Pending',
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    },
    referenceId: {
        type: String,
        unique: true,
    },
});

module.exports = mongoose.model('Transaction', transactionSchema);
