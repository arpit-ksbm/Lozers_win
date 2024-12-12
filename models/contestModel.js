const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSchema = new Schema({
    contestName: {
        type: String,
        required: true,
    },
    entryFee: {
        type: Number,
        required: true,
    },
    prizePool: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0
    },
    Prize: {
        type: String,
        default: "5 Lakh"
    },
    maxParticipants: {
        type: Number,
        required: true,
    },
    leftParticipants: {
        type: Number,
        required: true,
        default: function() {
            return this.maxParticipants; // Initially, it will be equal to maxParticipants
        }
    },
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rank: { type: Number }
    }],
    rankAndWinning: [ // New field
        {
            rankRange: { type: String, required: true }, // Example: "1", "2-4", "5-10"
            winningAmount: { type: Number, required: true }, // Example: 10000
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
