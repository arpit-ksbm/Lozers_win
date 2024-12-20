const Team = require("../models/teamModel");
const FantasyPoints = require("../models/fantasyPointsModel");
const {calculateFantasyPoints} = require("../services/pointService");
const axios = require("axios");

exports.calculateTeamScore = async function (req, res) {
  const { userId, matchId } = req.body;

  try {
    // Step 1: Fetch the user's team

    // Step 2: Fetch match data from the API
    const response = await axios.get(
      `https://rest.entitysport.com/v2/matches/${matchId}/scorecard?token=cc8b2f3c9eba434f4a524a830e12f8d2`
    );
    const matchData = response.data;

    if (!matchData || matchData.status !== "ok") {
      return res.status(500).json({ error: "Failed to fetch match data." });
    }

    const innings = matchData.response.innings;
    // Step 3: Fetch fantasy points configuration
    const re = await calculateFantasyPoints(innings)
    // Step 5: Return the total score
    return res.json(re);
  } catch (error) {
    console.error("Error calculating team score:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
