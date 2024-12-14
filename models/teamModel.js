const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: String, required: true }, // Match ID
    teamName: { type: String, required: true }, // Example: "arpit11(T1)"
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }], // Array of player IDs or names
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true  }, // Player ID or name
    viceCaptain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true  }, // Player ID or name
});

module.exports = mongoose.model('Team', TeamSchema);
