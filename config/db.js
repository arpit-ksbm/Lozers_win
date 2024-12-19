const mongoose = require('mongoose');
const fetchMatches = require('../services/matchService'); // Adjust the path according to your file structure
// const fetchPoints = require('../services/pointService')

const dbURI = 'mongodb+srv://Atul:EVi8XkwnQFABSNUP@lozerwin.hssia.mongodb.net/?retryWrites=true&w=majority&appName=LozersWin';
// const dbURI = "mongodb://127.0.0.1:27017/losers_win"

module.exports = async function dbConnection() {
  try {
    // Wait for Mongoose to connect before continuing
    await mongoose.connect(dbURI, { bufferCommands: false });
    console.log("Connected to database");

    // After connecting to the DB, call fetchMatches
    await fetchMatches();
    // await fetchPoints();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};
