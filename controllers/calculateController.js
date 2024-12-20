const Team = require("../models/teamModel");
const FantasyPoints = require("../models/fantasyPointsModel");
const Player = require("../models/playersModel");
const { calculateFantasyPoints } = require("../services/pointService");
const axios = require("axios");

exports.calculateTeamScore = async function (req, res) {
  const { userId, matchId } = req.body;

  try {
    // Step 1: Fetch all teams for the user in the given match and populate the player references
    const userTeams = await Team.find({ userId, matchId }).populate('players.player');
    if (!userTeams || userTeams.length === 0) {
      return res.status(404).json({ error: "No teams found for the given user and match." });
    }

    // Log userTeams for debugging
    console.log("User Teams:", JSON.stringify(userTeams, null, 2));

    // Step 2: Fetch match data from the API
    const response = await axios.get(
      `https://rest.entitysport.com/v2/matches/${matchId}/scorecard?token=cc8b2f3c9eba434f4a524a830e12f8d2`
    );
    const matchData = response.data;

    console.log("Match Data:", JSON.stringify(matchData, null, 2));

    if (!matchData || matchData.status !== "ok") {
      return res.status(500).json({ error: "Failed to fetch match data." });
    }

    const innings = matchData.response.innings;
    const matchFormat = matchData.response.format_str; // e.g., "T20"

    // Step 3: Calculate fantasy points for all players
    const totalPointsPerPlayer = await calculateFantasyPoints(innings, matchFormat);

    // Log totalPointsPerPlayer for debugging
    console.log("Total Points Per Player:", JSON.stringify(totalPointsPerPlayer, null, 2));

    // Step 4: Calculate the score for each team
    let teamScores = [];
    userTeams.forEach((userTeam) => {
      let teamScore = 0;
      userTeam.players.forEach((teamPlayer) => {
        const playerDoc = teamPlayer.player;
        if (!playerDoc) {
          console.log(`Player document not found for player: ${teamPlayer.player}`);
          return;
        }

        const matchDataPlayerId = playerDoc.player_id; // Ensure Player model has 'playerId'
        if (!matchDataPlayerId) {
          console.log(`Player ID not found for player: ${playerDoc._id}`);
          return;
        }

        const playerPoints = totalPointsPerPlayer[matchDataPlayerId] || { totalPoints: 0 };
        let playerScore = playerPoints.totalPoints;

        // Apply captain and vice-captain multipliers
        if (teamPlayer.isCaptain) {
          playerScore *= 2;
        }
        if (teamPlayer.isViceCaptain) {
          playerScore *= 1.5;
        }

        console.log(`Player: ${playerDoc.name}, Points: ${playerScore}`);

        teamScore += playerScore;
      });

      console.log(`Team ${userTeam.teamName} Score:`, teamScore);
      teamScores.push({
        teamId: userTeam._id,
        teamName: userTeam.teamName,
        teamScore
      });
    });

    // Step 5: Return the calculated scores for all teams
    return res.json({ userId, matchId, teamScores });
  } catch (error) {
    console.error("Error calculating team score:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
