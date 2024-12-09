const mongoose = require("mongoose");

const userTeamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchId: { type: String, required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    players: [{ type: String, required: true }], // Array of player IDs
    score: { type: Number, default: 0 }, // Score will be updated later
});

module.exports = mongoose.model("UserTeam", userTeamSchema);
