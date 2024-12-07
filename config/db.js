const mongoose = require('mongoose')

const dbURI = 'mongodb+srv://Atul:EVi8XkwnQFABSNUP@lozerwin.hssia.mongodb.net/?retryWrites=true&w=majority&appName=LozersWin';
// const dbURI = "mongodb://127.0.0.1:27017/losers_win"


module.exports = function dbConnection() {
    mongoose.connect(dbURI, {bufferCommands: false})
    console.log("connected to database")
}