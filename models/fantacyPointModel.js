// fantasyPointsModel.js
const mongoose = require('mongoose');

const FantasyPointsSchema = new mongoose.Schema({
    format: { type: String, required: true, unique: true }, // T20, ODI, Test, etc.
    points: {
        wicket: { type: Number, default: 0 },
        run: { type: Number, default: 0 },
        six: { type: Number, default: 0 },
        catch: { type: Number, default: 0 },
        playing11: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('FantasyPoints', FantasyPointsSchema);