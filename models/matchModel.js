const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    matchId: {
        type: String,
        required: true,
        unique: true,
    },
    teamA: {
        type: String,
        required: true,
    },
    teamB: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Live', 'Completed'],
        default: 'Upcoming',
    },
    matchType: {
        type: String,
        enum: ['Test', 'ODI', 'T20'],
    },
    venue: {
        type: String,
    },
    matchResults: {
        type: Object,  // For storing result data like scores, wickets, etc.
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Match', matchSchema);
