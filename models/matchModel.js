const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  match_id: { type: Number, unique: true, required: true }, // Match ID, required field
  title: { type: String, required: true }, // Match title (e.g., "Team A vs Team B")
  short_title: {type: String, required: true},
  status: { type: Number, required: true }, // Status (e.g., 2 for Completed)
  status_str: { type: String}, // String representation of status (e.g., "Completed")

  competition: {
    cid: { type: Number, required: true },
    title: { type: String, required: true },
    // category: { type: String, required: true },
    // match_format: { type: String, required: true },
    // season: { type: String, required: true },
    // datestart: { type: String, required: true },
    // dateend: { type: String, required: true },
    // total_matches: { type: String, required: true },
  },
  
  teama: {
    team_id: { type: Number, required: true }, // Team ID
    name: { type: String, required: true }, // Team Name
    short_name: { type: String, required: true },
    logo_url: { type: String, required: true },
   
  },
  
  teamb: {
    team_id: { type: Number, required: true }, // Team ID
    name: { type: String, required: true }, // Team Name
    short_name: { type: String, required: true },
    logo_url: { type: String, required: true },
  },

  date_start: { type: String, required: true }, // Match start time
  date_end: { type: String, required: true },
  venue: {
    name: { type: String, required: true }, // Venue name
    location: { type: String, required: true }, // Venue location
    country: { type: String, required: true }, // Venue country
  },
  
  result: { type: String, required: true }, // Match result (e.g., "Team A won by 10 runs")
  winning_team_id: { type: Number, required: true }, // ID of the winning team
  
  toss: {
    text: { type: String, required: true }, // Toss description (e.g., "Team A elected to bowl")
    winner: { type: Number, required: true }, // Toss winner ID
    decision: { type: Number, required: true }, // Toss decision (e.g., 1 for bat, 2 for bowl)
  },
});

module.exports = mongoose.model("Match", MatchSchema);
