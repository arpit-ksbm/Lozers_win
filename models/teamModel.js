const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
    },
    players: [
        {
            playerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player',  // A player model could be created separately
            },
            role: {
                type: String,
                enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'],
            },
        },
    ],
    totalPoints: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Team', teamSchema);
