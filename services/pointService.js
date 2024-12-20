const FantasyPoints = require('../models/fantasyPointsModel'); // schema file import

const insertFantasyPoints = async () => {
    const fantasyData = new FantasyPoints({
        importantFantasyPoints: {
          T20: { wicket: 25, run: 1, catch: 10, consecutiveBoundary: 0, consecutiveSix: 0 },
          ODI: { wicket: 25, run: 1, catch: 10, consecutiveBoundary: 0, consecutiveSix: 0 },
          // Continue for other formats...
        },
        battingPoints: {
          T20: { run: 1, boundaryBonus: 1, consecutiveBoundaryBonus: 0, sixBonus: 2, consecutiveSixBonus: 0 },
          ODI: { run: 1, boundaryBonus: 1, consecutiveBoundaryBonus: 0, sixBonus: 2, consecutiveSixBonus: 0 },
          // Continue for other formats...
        },
        bowlingPoints: {
          T20: { wicket: 25, bonus: 10, twoWicketBonus: 0, threeWicketBonus: 10, fourWicketBonus: 20 },
          ODI: { wicket: 25, bonus: 10, twoWicketBonus: 0, threeWicketBonus: 10, fourWicketBonus: 10 },
          // Continue for other formats...
        },
        fieldingPoints: {
          T20: { catch: 10, twoCatchBonus: 0, threeCatchBonus: 5 },
          ODI: { catch: 10, twoCatchBonus: 0, threeCatchBonus: 5 },
          // Continue for other formats...
        },
        additionalPoints: {
          captionPoints: 2,
          viceCaptionPoints: 1.5,
          playing6Points: 0,
          playing11Points: 80,
          notPlayingPoints: 160,
        },
      });
      

  try {
    const result = await fantasyData.save();
    console.log('Fantasy Data Inserted:', result);
  } catch (error) {
    console.error('Error inserting fantasy data:', error);
  }
};
const calculateFantasyPoints = async (matchData) => {
  try {
    return matchData;
    // Fetch the default fantasy points data
    const fantasyData = await FantasyPoints.findOne();

    if (!fantasyData) {
      throw new Error('Fantasy points data not found');
    }

    const playersPoints = [];

    matchData.forEach((inning) => {
      // Batting points calculation
      inning.batsmen.forEach((batsman) => {
        if (batsman.batting === "true") {
          let battingPoints = 0;
          let runs = 0;
          let fours = 0;
          let sixes = 0;

          if (batsman.runs) {
            runs = Number(batsman.runs);
            battingPoints += runs * fantasyData.T20.run;
          }
          if (batsman.fours) {
            fours = Number(batsman.fours);
            battingPoints += fours * fantasyData.T20.boundary;
          }
          if (batsman.sixes) {
            sixes = Number(batsman.sixes);
            battingPoints += sixes * fantasyData.T20.boundary; // Same points as boundary
          }

          let additionalPoints = 0;
          if (batsman.isPlaying11 === "true") {
            additionalPoints += fantasyData.T20.playing11;
          }

          playersPoints.push({
            playerName: batsman.name,
            playerId: batsman.batsman_id,
            stats: {
              runs,
              fours,
              sixes,
              battingPoints,
            },
            additionalPoints,
            totalPoints: battingPoints + additionalPoints
          });
        }
      });

      // Bowling points calculation
      inning.bowlers.forEach((bowler) => {
        if (bowler.bowling === "true") {
          let bowlingPoints = 0;
          let wickets = 0;

          if (bowler.wickets) {
            wickets = Number(bowler.wickets);
            bowlingPoints += wickets * fantasyData.T20.wicket;
          }

          let additionalPoints = 0;
          if (bowler.isPlaying11 === "true") {
            additionalPoints += fantasyData.T20.playing11;
          }

          playersPoints.push({
            playerName: bowler.name,
            playerId: bowler.bowler_id,
            stats: {
              wickets,
              bowlingPoints,
            },
            additionalPoints,
            totalPoints: bowlingPoints + additionalPoints
          });
        }
      });

      // Fielding points calculation
      inning.fielder.forEach((fielder) => {
        let fieldingPoints = 0;
        let catches = 0;
        let consecutiveBoundary = 0;

        if (fielder.catches) {
          catches = Number(fielder.catches);
          fieldingPoints += catches * fantasyData.T20.catch;
        }

        // Check for consecutive boundaries (if applicable)
        if (fielder.consecutiveBoundary) {
          consecutiveBoundary = Number(fielder.consecutiveBoundary);
          fieldingPoints += consecutiveBoundary * fantasyData.T20.consecutiveBoundary;
        }

        let additionalPoints = 0;
        if (fielder.isPlaying11 === "true") {
          additionalPoints += fantasyData.T20.playing11;
        }

        playersPoints.push({
          playerName: fielder.fielder_name,
          playerId: fielder.fielder_id,
          stats: {
            catches,
            consecutiveBoundary,
            fieldingPoints,
          },
          additionalPoints,
          totalPoints: fieldingPoints + additionalPoints
        });
      });
    });

    // Now combine the points for each player by their playerId
    const totalPointsPerPlayer = playersPoints.reduce((acc, player) => {
      if (!acc[player.playerId]) {
        acc[player.playerId] = {
          playerName: player.playerName,
          stats: {
            runs: 0,
            fours: 0,
            sixes: 0,
            wickets: 0,
            catches: 0,
            consecutiveBoundary: 0,
          },
          totalPoints: 0,
        };
      }

      // Add individual player stats
      acc[player.playerId].stats.runs += player.stats.runs || 0;
      acc[player.playerId].stats.fours += player.stats.fours || 0;
      acc[player.playerId].stats.sixes += player.stats.sixes || 0;
      acc[player.playerId].stats.wickets += player.stats.wickets || 0;
      acc[player.playerId].stats.catches += player.stats.catches || 0;
      acc[player.playerId].stats.consecutiveBoundary += player.stats.consecutiveBoundary || 0;

      acc[player.playerId].totalPoints += player.totalPoints;

      return acc;
    }, {});

    return totalPointsPerPlayer;
  } catch (error) {
    console.error('Error calculating fantasy points per player:', error);
    throw error;
  }
};


// Call the insert function
module.exports = {insertFantasyPoints,calculateFantasyPoints};
