const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    player_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String }, // e.g., "bat", "bowl", "wk"
    short_name: { type: String, required: true },
    fantasy_player_rating: {type: Number},
    playing11: { type: Boolean, default: false },
    substitute: { type: Boolean, default: false },
    nationality: { type: String },
    team_id: { type: String, required: true },
    match_id: [{ type: String, required: true }],
});

module.exports = mongoose.model("Player", playerSchema);
