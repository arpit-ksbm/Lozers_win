const mongoose = require('mongoose');
const { Schema } = mongoose;

const winningSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Contest' ,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Team',
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
