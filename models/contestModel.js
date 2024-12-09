const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSchema = new Schema({
    matchId: {
        type: Number,
        required: true,
    },
    matchDetails: {
        title: String,
        shortTitle: String,
        teamA: {
            name: String,
            shortName: String,
            logoUrl: String,
        },
        teamB: {
            name: String,
            shortName: String,
            logoUrl: String,
        },
        startTime: Date,
        venue: {
            name: String,
            location: String,
        },
    },
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
    maxParticipants: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
