const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: String, required: true }, // Match ID
    teamName: { type: String }, // Example: "arpit11(T1)"
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player'}], // Array of player IDs or names
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player'  }, // Player ID or name
    viceCaptain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player'  }, // Player ID or name
    isCompleted: { type: Boolean, default: false},
    teamUniqueCode: { type: String}
});

module.exports = mongoose.model('Team', TeamSchema);
