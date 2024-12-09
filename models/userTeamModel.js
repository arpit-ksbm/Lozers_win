const mongoose = require("mongoose");

const userTeamSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
        contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Player",
                required: true,
            },
        ], // Array of player IDs
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserTeam", userTeamSchema);
