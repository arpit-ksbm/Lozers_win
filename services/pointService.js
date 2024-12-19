const FantasyPoints = require('../models/fantasyPointsModel'); // schema file import

const insertFantasyPoints = async () => {
  const fantasyData = new FantasyPoints({
    T10: {
      playing11: 80,
      wicket: 25,
      run: 1,
      catch: 10,
      boundary: 4,
      consecutiveBoundary: 0,
      six: 6,
      consecutiveSix: 0,
      twentyRunBonus: 10,
      thityRunBonus: 15,
      halfCenturyBonus: 25,
      centuryBonus: 50,
      doubleCenturyBonus: 100,
      dismissalForADuck: -5,
      dismissalForAGoldenDuck: -10,
      twoWicketBonus: 10,
      threWicketBonus: 20,
      fourWicketBonus: 30,
      fiveWicketBonus: 50,
      sixWicketBonus: 60,
      maidenOver: 15,
      stumping: 10,
      runOutDirectHit: 15,
      runOutNotDirectHit: 10,
    },
    T20: {
      playing11: 80,
      wicket: 25,
      run: 1,
      catch: 10,
      boundary: 4,
      consecutiveBoundary: 0,
      six: 6,
      consecutiveSix: 0,
      twentyRunBonus: 10,
      thityRunBonus: 15,
      halfCenturyBonus: 25,
      centuryBonus: 50,
      doubleCenturyBonus: 100,
      dismissalForADuck: -5,
      dismissalForAGoldenDuck: -10,
      twoWicketBonus: 10,
      threWicketBonus: 20,
      fourWicketBonus: 30,
      fiveWicketBonus: 50,
      sixWicketBonus: 60,
      maidenOver: 15,
      stumping: 10,
      runOutDirectHit: 15,
      runOutNotDirectHit: 10,
    },
    ODI: {
      playing11: 80,
      wicket: 25,
      run: 1,
      catch: 10,
      boundary: 4,
      consecutiveBoundary: 0,
      six: 6,
      consecutiveSix: 0,
      fiftyRunBonus: 20,
      seventyRunBonus: 30,
      halfCenturyBonus: 25,
      centuryBonus: 50,
      doubleCenturyBonus: 100,
      dismissalForADuck: -5,
      dismissalForAGoldenDuck: -10,
      twoWicketBonus: 10,
      threeWicketBonus: 20,
      fourWicketBonus: 30,
      fiveWicketBonus: 50,
      sixWicketBonus: 60,
      maidenOver: 15,
      stumping: 10,
      runOutDirectHit: 15,
      runOutNotDirectHit: 10,
    },
    TEST: {
      playing11: 80,
      wicket: 25,
      run: 1,
      catch: 10,
      boundary: 4,
      consecutiveBoundary: 0,
      six: 6,
      consecutiveSix: 0,
      fiftyRunBonus: 20,
      hundredRunBonus: 40,
      halfCenturyBonus: 25,
      centuryBonus: 50,
      doubleCenturyBonus: 100,
      tripleCenturyBonus: 150,
      dismissalForADuck: -5,
      dismissalForAGoldenDuck: -10,
      twoWicketBonus: 10,
      threeWicketBonus: 20,
      fourWicketBonus: 30,
      fiveWicketBonus: 50,
      sixWicketBonus: 60,
      maidenOver: 15,
      stumping: 10,
      runOutDirectHit: 15,
      runOutNotDirectHit: 10,
    },
  });

  try {
    const result = await fantasyData.save();
    console.log('Fantasy Data Inserted:', result);
  } catch (error) {
    console.error('Error inserting fantasy data:', error);
  }
};


// const calculateFantasyPoints = async (matchData) => {
//   try {
//     const fantasyData = await FantasyPoints.findOne();

//     if (!fantasyData) {
//       throw new Error('Fantasy points data not found');
//     }

//     const points = {
//       battingPoints: 0,
//       bowlingPoints: 0,
//       fieldingPoints: 0,
//       additionalPoints: 0,
//     };

//     // Batting points calculation
//     matchData.batsmen.forEach((batsman) => {
//       if (batsman.batting === "true") {
//         if (batsman.runs) {
//           points.battingPoints += Number(batsman.runs) * fantasyData.battingPoints.T20.run;
//         }
//         if (batsman.fours) {
//           points.battingPoints += Number(batsman.fours) * fantasyData.battingPoints.T20.boundaryBonus;
//         }
//         if (batsman.sixes) {
//           points.battingPoints += Number(batsman.sixes) * fantasyData.battingPoints.T20.sixBonus;
//         }
//       }
//     });

//     // Bowling points calculation
//     matchData.bowlers.forEach((bowler) => {
//       if (bowler.bowling === "true") {
//         if (bowler.wickets) {
//           points.bowlingPoints += Number(bowler.wickets) * fantasyData.bowlingPoints.T20.wicket;
//           if (bowler.wickets >= 2) {
//             points.bowlingPoints += fantasyData.bowlingPoints.T20.twoWicketBonus;
//           }
//           if (bowler.wickets >= 3) {
//             points.bowlingPoints += fantasyData.bowlingPoints.T20.threeWicketBonus;
//           }
//           if (bowler.wickets >= 4) {
//             points.bowlingPoints += fantasyData.bowlingPoints.T20.fourWicketBonus;
//           }
//         }
//       }
//     });

//     // Fielding points calculation
//     matchData.fielder.forEach((fielder) => {
//       if (fielder.catches) {
//         points.fieldingPoints += Number(fielder.catches) * fantasyData.fieldingPoints.T20.catch;
//         if (fielder.catches >= 2) {
//           points.fieldingPoints += fantasyData.fieldingPoints.T20.twoCatchBonus;
//         }
//         if (fielder.catches >= 3) {
//           points.fieldingPoints += fantasyData.fieldingPoints.T20.threeCatchBonus;
//         }
//       }
//     });

//     // Additional points for roles and playing status
//     matchData.batsmen.forEach((player) => {
//       if (player.isCaption === "true") {
//         points.additionalPoints += fantasyData.additionalPoints.captionPoints;
//       }
//       if (player.isViceCaption === "true") {
//         points.additionalPoints += fantasyData.additionalPoints.viceCaptionPoints;
//       }
//       if (player.isPlaying6 === "true") {
//         points.additionalPoints += fantasyData.additionalPoints.playing6Points;
//       }
//       if (player.isPlaying11 === "true") {
//         points.additionalPoints += fantasyData.additionalPoints.playing11Points;
//       }
//       if (player.isPlaying === "false") {
//         points.additionalPoints += fantasyData.additionalPoints.notPlayingPoints;
//       }
//     });

//     return points;
//   } catch (error) {
//     console.error('Error calculating fantasy points:', error);
//     throw error;
//   }
// };
// Call the insert function
module.exports = insertFantasyPoints;
