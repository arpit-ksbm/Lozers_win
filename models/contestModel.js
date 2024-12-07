const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSchema = new Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match', 
        required: true,
    },
    contestType: {
        type: String,
        enum: ['public', 'private'], 
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
    maxParticipants: {
        type: Number,
        required: true,
    },
    joinedParticipants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming user schema is defined
    }],
    winners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming user schema is defined
    }],
    prizeDistribution: {
        type: Map,
        of: Number,  // Example: { "1": 500, "2": 300, "3": 200 } where the key is the rank and value is prize
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;