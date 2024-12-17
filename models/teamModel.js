const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: String, required: true }, // Match ID
    teamName: { type: String }, // Example: "arpit11(T1)"
    players: [
        {
            player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
            isCaptain: { type: Boolean, default: false },
            isViceCaptain: { type: Boolean, default: false }
        }
    ]
});

module.exports = mongoose.model('Team', TeamSchema);
