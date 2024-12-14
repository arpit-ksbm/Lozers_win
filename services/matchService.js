const axios = require("axios");
const Match = require("../models/matchModel"); // Adjust the path according to your file structure
const mongoose = require('mongoose')

const fetchMatches = async () => {
  try {
    // Ensure Mongoose is connected before continuing
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected.");
    }

    // Fetch match data from the API
    const { data } = await axios.get(
      "https://rest.entitysport.com/v2/matches/?status=2&token=ec471071441bb2ac538a0ff901abd249"
    );

    if (data.status === "ok" && data.response.items) {
      const matches = data.response.items;

      const processedMatches = matches.map(match => ({
        match_id: match.match_id, 
        title: match.title, 
        short_title: match.short_title,
        status: match.status, 
        status_str: match.status_str, 
        competition: {
            cid: match.competition.cid,
            title: match.competition.title,
            // title: match.comptition.title
        },
        teama: {
          team_id: match.teama.team_id,
          name: match.teama.name,
          short_name: match.teama.short_name,
          logo_url: match.teama.logo_url
        },
        teamb: {
          team_id: match.teamb.team_id,
          name: match.teamb.name,
          short_name: match.teamb.short_name,
          logo_url: match.teamb.logo_url
        },
        date_start: match.date_start,
        venue: {
          name: match.venue.name,
          location: match.venue.location,
          country: match.venue.country,
        },
        result: match.result,
        winning_team_id: match.winning_team_id,
        toss: {
          text: match.toss.text,
          winner: match.toss.winner,
          decision: match.toss.decision,
        },
      }));

      // Insert or update the processed matches using upsert
      for (let match of processedMatches) {
        await Match.updateOne(
          { match_id: match.match_id },  // Match based on match_id
          { $set: match },                // Update fields
          { upsert: true }                // If not found, insert new
        );
      }

      console.log(`[${new Date().toISOString()}] Matches saved or updated in the database.`);
    } else {
      console.log(`[${new Date().toISOString()}] No matches found in the API response.`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching matches:`, error.message);
  }
};

module.exports = fetchMatches;
