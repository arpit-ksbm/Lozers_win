const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema for Fantasy Points
const fantasyPointsSchema = new Schema(
  {
    importantFantasyPoints: {
      T20: { wicket: Number, run: Number, catch: Number, consecutiveBoundary: Number, consecutiveSix: Number },
      ODI: { wicket: Number, run: Number, catch: Number, consecutiveBoundary: Number, consecutiveSix: Number },
      Test: { wicket: Number, run: Number, catch: Number, consecutiveBoundary: Number, consecutiveSix: Number },
      T10: { wicket: Number, run: Number, catch: Number, consecutiveBoundary: Number, consecutiveSix: Number },
      "The Hundred": { wicket: Number, run: Number, catch: Number, consecutiveBoundary: Number, consecutiveSix: Number },
      SuperSix: { wicket: Number, run: Number, catch: Number, consecutiveBoundary: Number, consecutiveSix: Number },
    },
    battingPoints: {
      T20: { run: Number, boundaryBonus: Number, consecutiveBoundaryBonus: Number, sixBonus: Number, consecutiveSixBonus: Number, twentyRunBonus: Number, thirtyRunBonus: Number, halfCenturyBonus: Number, centuryBonus: Number, doubleCenturyBonus: Number, dismissalForDuck: Number, dismissalForGoldenDuck: Number },
      ODI: { run: Number, boundaryBonus: Number, consecutiveBoundaryBonus: Number, sixBonus: Number, consecutiveSixBonus: Number, twentyRunBonus: Number, thirtyRunBonus: Number, halfCenturyBonus: Number, centuryBonus: Number, doubleCenturyBonus: Number, dismissalForDuck: Number, dismissalForGoldenDuck: Number },
    },
    bowlingPoints: {
      T20: { wicket: Number, bonus: Number, twoWicketBonus: Number, threeWicketBonus: Number, fourWicketBonus: Number, fiveWicketBonus: Number, sixWicketBonus: Number, maidenOver: Number, economyRatePoints: Map },
      ODI: { wicket: Number, bonus: Number, twoWicketBonus: Number, threeWicketBonus: Number, fourWicketBonus: Number, fiveWicketBonus: Number, sixWicketBonus: Number, maidenOver: Number, economyRatePoints: Map },
    },
    fieldingPoints: {
      T20: { catch: Number, twoCatchBonus: Number, threeCatchBonus: Number, fourCatchBonus: Number, fiveCatchBonus: Number, stumping: Number, runOutDirectHit: Number, runOutNotDirectHit: Number },
      ODI: { catch: Number, twoCatchBonus: Number, threeCatchBonus: Number, fourCatchBonus: Number, fiveCatchBonus: Number, stumping: Number, runOutDirectHit: Number, runOutNotDirectHit: Number },
    },
    additionalPoints: {
      captionPoints: Number,
      viceCaptionPoints: Number,
      playing6Points: Number,
      playing11Points: Number,
      notPlayingPoints: Number,
      notPlayingCaptionPoints: Number,
      notPlayingViceCaptionPoints: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


// Create the model
const FantasyPoint = mongoose.model("FantasyPoint", fantasyPointsSchema);

module.exports = FantasyPoint;
