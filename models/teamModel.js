const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: String, required: true }, // Match ID
    teamName: { type: String, required: true }, // Example: "arpit11(T1)"
    players: [{ type: String, required: true }], // Array of player IDs or names
    captain: { type: String, required: true }, // Player ID or name
    viceCaptain: { type: String, required: true }, // Player ID or name
});

module.exports = mongoose.model('Team', TeamSchema);
