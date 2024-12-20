// services/pointService.js
const FantasyPoints = require("../models/fantasyPointsModel");

const calculateFantasyPoints = async (innings, format) => {
  try {
    // Fetch the fantasy points configuration for the given format
    const fantasyData = await FantasyPoints.findOne();
    if (!fantasyData) {
      throw new Error("Fantasy points data not found");
    }

    const pointsConfig = fantasyData[format]; // e.g., fantasyData.T20
    if (!pointsConfig) {
      throw new Error(`Fantasy points config for ${format} not found`);
    }

    const playersPoints = [];

    innings.forEach((inning) => {
      // Batting points calculation
      const batsmen = inning.batsmen || [];
      batsmen.forEach((batsman) => {
        let battingPoints = 0;
        const runs = Number(batsman.runs) || 0;
        const fours = Number(batsman.fours) || 0;
        const sixes = Number(batsman.sixes) || 0;

        battingPoints += runs * (pointsConfig.run || 0);
        battingPoints += fours * (pointsConfig.boundary || 0);
        battingPoints += sixes * (pointsConfig.six || 0);

        // Bonus points for milestones
        if (runs >= 50) {
          battingPoints += pointsConfig.halfCenturyBonus || 0;
        }
        if (runs >= 100) {
          battingPoints += pointsConfig.centuryBonus || 0;
        }
        if (batsman.dismissal === "dismissalForADuck") {
          battingPoints += pointsConfig.dismissalForADuck || 0;
        }

        playersPoints.push({
          playerId: batsman.batsman_id,
          totalPoints: battingPoints,
        });
      });

      // Bowling points calculation
      const bowlers = inning.bowlers || [];
      bowlers.forEach((bowler) => {
        let bowlingPoints = 0;
        const wickets = Number(bowler.wickets) || 0;

        bowlingPoints += wickets * (pointsConfig.wicket || 0);

        // Bonus points for wickets
        if (wickets >= 3) {
          bowlingPoints += pointsConfig.threeWicketBonus || 0;
        }
        if (wickets >= 5) {
          bowlingPoints += pointsConfig.fiveWicketBonus || 0;
        }

        playersPoints.push({
          playerId: bowler.bowler_id,
          totalPoints: bowlingPoints,
        });
      });

      // Fielding points calculation
      const fielders = inning.fielder || [];
      fielders.forEach((fielder) => {
        let fieldingPoints = 0;
        const catches = Number(fielder.catches) || 0;
        const runOuts = Number(fielder.run_outs) || 0;
        const stumpings = Number(fielder.stumpings) || 0;

        fieldingPoints += catches * (pointsConfig.catch || 0);
        fieldingPoints += runOuts * (pointsConfig.runOutDirectHit || 0);
        fieldingPoints += stumpings * (pointsConfig.stumping || 0);

        playersPoints.push({
          playerId: fielder.fielder_id,
          totalPoints: fieldingPoints,
        });
      });
    });

    // Aggregate points per player
    const totalPointsPerPlayer = playersPoints.reduce((acc, player) => {
      if (!acc[player.playerId]) {
        acc[player.playerId] = { totalPoints: 0 };
      }
      acc[player.playerId].totalPoints += player.totalPoints;
      return acc;
    }, {});

    return totalPointsPerPlayer;
  } catch (error) {
    console.error("Error calculating fantasy points:", error);
    throw error;
  }
};

module.exports = { calculateFantasyPoints };
