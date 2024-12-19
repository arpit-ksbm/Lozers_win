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
    const fantasyData = await FantasyPoints.findOne();

    if (!fantasyData) {
      throw new Error('Fantasy points data not found');
    }

    const points = {
      battingPoints: 0,
      bowlingPoints: 0,
      fieldingPoints: 0,
      additionalPoints: 0,
    };

    // Batting points calculation
    matchData.batsmen.forEach((batsman) => {
      if (batsman.batting === "true") {
        if (batsman.runs) {
          points.battingPoints += Number(batsman.runs) * fantasyData.battingPoints.T20.run;
        }
        if (batsman.fours) {
          points.battingPoints += Number(batsman.fours) * fantasyData.battingPoints.T20.boundaryBonus;
        }
        if (batsman.sixes) {
          points.battingPoints += Number(batsman.sixes) * fantasyData.battingPoints.T20.sixBonus;
        }
      }
    });

    // Bowling points calculation
    matchData.bowlers.forEach((bowler) => {
      if (bowler.bowling === "true") {
        if (bowler.wickets) {
          points.bowlingPoints += Number(bowler.wickets) * fantasyData.bowlingPoints.T20.wicket;
          if (bowler.wickets >= 2) {
            points.bowlingPoints += fantasyData.bowlingPoints.T20.twoWicketBonus;
          }
          if (bowler.wickets >= 3) {
            points.bowlingPoints += fantasyData.bowlingPoints.T20.threeWicketBonus;
          }
          if (bowler.wickets >= 4) {
            points.bowlingPoints += fantasyData.bowlingPoints.T20.fourWicketBonus;
          }
        }
      }
    });

    // Fielding points calculation
    matchData.fielder.forEach((fielder) => {
      if (fielder.catches) {
        points.fieldingPoints += Number(fielder.catches) * fantasyData.fieldingPoints.T20.catch;
        if (fielder.catches >= 2) {
          points.fieldingPoints += fantasyData.fieldingPoints.T20.twoCatchBonus;
        }
        if (fielder.catches >= 3) {
          points.fieldingPoints += fantasyData.fieldingPoints.T20.threeCatchBonus;
        }
      }
    });

    // Additional points for roles and playing status
    matchData.batsmen.forEach((player) => {
      if (player.isCaption === "true") {
        points.additionalPoints += fantasyData.additionalPoints.captionPoints;
      }
      if (player.isViceCaption === "true") {
        points.additionalPoints += fantasyData.additionalPoints.viceCaptionPoints;
      }
      if (player.isPlaying6 === "true") {
        points.additionalPoints += fantasyData.additionalPoints.playing6Points;
      }
      if (player.isPlaying11 === "true") {
        points.additionalPoints += fantasyData.additionalPoints.playing11Points;
      }
      if (player.isPlaying === "false") {
        points.additionalPoints += fantasyData.additionalPoints.notPlayingPoints;
      }
    });

    return points;
  } catch (error) {
    console.error('Error calculating fantasy points:', error);
    throw error;
  }
};
// Call the insert function
module.exports = {insertFantasyPoints,calculateFantasyPoints};
