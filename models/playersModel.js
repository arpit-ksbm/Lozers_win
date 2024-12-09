const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    player_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String }, // e.g., "bat", "bowl", "wk"
    playing11: { type: Boolean, default: false },
    team_id: { type: String, required: true },
    match_id: { type: String, required: true },
});

module.exports = mongoose.model("Player", playerSchema);
