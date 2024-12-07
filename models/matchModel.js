const mongoose = require('mongoose');
const { Schema } = mongoose;

const matchSchema = new Schema({
    matchId: {
        type: Number,
        required: true,
        unique: true,
    },
    title: String,
    shortTitle: String,
    teamA: {
        name: String,
        shortName: String,
        logo: String,
    },
    teamB: {
        name: String,
        shortName: String,
        logo: String,
    },
    startTime: Date,
    venue: {
        name: String,
        location: String,
    },
    status: String,
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
