const { log } = require('console');
const configureMulter = require('../configureMulter');
const User = require('../models/userModel');
const crypto = require('crypto');
const multer = require("multer");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const Contest = require('../models/contestModel')
const axios = require("axios");
const Match = require("../models/matchModel");
const Player = require("../models/playersModel");
const UserTeam = require("../models/teamModel");

const uploadUserImage = configureMulter("uploads/userImage/", [
    { name: "profileImage", maxCount: 1 },
]);

exports.userLogin = async function (req, res) {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Please provide phoneNumber",
            });
        }

        // Validate phone number format (must be 10 digits)
        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit phone number",
            });
        }

        // Generate OTP (6 digits)
        const otp = crypto.randomInt(100000, 999999);
        console.log(`Generated OTP: ${otp}`);

        // Create expiration time for OTP
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

        // Check if user already exists
        let user = await User.findOne({ phoneNumber });
        if (user) {
            // If the user exists, update the OTP and expiry time
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        } else {
            // If the user doesn't exist, create a new user with OTP
            user = new User({
                phoneNumber,
                otp,
                otpExpiry,
            });
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "OTP generated successfully",
            otp: user.otp,
        });

    } catch (error) {
        console.error("Error during login/registration:", error);
        res.status(500).json({
            success: false,
            message: "Login/Registration failed",
            error: error.message,
        });
    }
};

exports.verifyOtp = async function (req, res) {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please provide phoneNumber and otp",
            });
        }

        // Validate phone number format (must be 10 digits)
        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit phone number",
            });
        }

        // Check if the user exists
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Check if OTP is expired
        const currentTime = new Date();
        if (currentTime > user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        // If OTP is valid and not expired, update the isVerify field
        user.isVerify = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT , { expiresIn: '1h' });

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            user,
            token: token
        });

    } catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).json({
            success: false,
            message: "OTP verification failed",
            error: error.message,
        });
    }
};

exports.updateUser = async function (req, res) {
    uploadUserImage(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res.status(500).json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { _id, name, userName, dateOfBirth, gender, address } = req.body;

            if (!_id) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }

            let user = await User.findById(_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Update other user details
            if (name) user.name = name;
            if (userName) user.userName = userName;
            if (dateOfBirth) user.dateOfBirth = dateOfBirth;
            if (gender) user.gender = gender;
            if (address) user.address = address;

            // If an image is uploaded, update the profileImage field
            if (req.files["profileImage"]) {
                const imagePath = req.files["profileImage"][0].path.replace(/^.userImage[\\/]/, "userImage/");
                user.profileImage = imagePath;
              }

            // Save the updated user
            await user.save();

            // Return success response
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                user: user,
            });

        } catch (error) {
            console.error("Error during user update:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update user",
                error: error.message,
            });
        }
    });
};

exports.updatePhoneNumber = async function(req, res) {
    try {
        const { _id, phoneNumber } = req.body;

        if (!_id || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Please provide phoneNumber and user id",
            });
        }

        // Validate phone number format (must be 10 digits)
        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit phone number",
            });
        }

        // Check if the user exists
        let user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the phone number is different from the existing one
        if (user.phoneNumber === phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "This phone number is already linked to your account",
            });
        }

        // Generate a new OTP (6 digits)
        const otp = crypto.randomInt(100000, 999999);
        console.log(`Generated OTP: ${otp}`);

        // Set OTP expiration time (e.g., 5 minutes)
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

        // Update the phone number and OTP
        user.phoneNumber = phoneNumber;
        user.otp = otp;
        user.otpExpiry = otpExpiry;

        // Save the updated user
        await user.save();

        // Return success response with OTP (for verification)
        res.status(200).json({
            success: true,
            message: "Phone number updated successfully. OTP sent for verification.",
            otp: otp,
        });
    } catch (error) {
        console.error("Error during phone number update:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update phone number",
            error: error.message,
        });
    }
};

exports.getAllContestByMatchId = async function (req, res) {
    try {
        const { matchId } = req.params;

        // Check if matchId is provided
        if (!matchId) {
            return res.status(400).json({
                success: false,
                message: "Match ID is required"
            });
        }

        // Fetch all contests from the database
        const contests = await Contest.find({ matchId });
        const matchDetails = await Match.findOne(
            { match_id: matchId },
            {
                "teama.short_name": 1,
                "teama.logo_url": 1,
                "teamb.short_name": 1,
                "teamb.logo_url": 1,
                "short_title": 1,
                _id: 0,
            }
        );
        

        // If no contests are found
        if (!contests || contests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No contests found for the given Match ID."
            });
        }

        // Return all contests
        return res.status(200).json({
            success: true,
            message: "Contests fetched successfully.",
            contests,
            matchDetails
        });
    } catch (error) {
        console.error("Error fetching contests:", error.message);

        // Send error response
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching contests.",
            error: error.message
        });
    }
};

exports.fetchPlayersByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;

        if (!matchId) {
            return res.status(400).json({
                success: false,
                message: "Match ID is required.",
            });
        }

        // Fetch data from EntitySport API
        const { data } = await axios.get(
            `https://rest.entitysport.com/v2/matches/${matchId}/squads/?token=${process.env.ENTITYSPORT_API_TOKEN}`
        );

        if (data.status === "ok" && data.response) {
            const { teama, teamb, players } = data.response;

            // Create a lookup map for detailed player data
            const playerDetailsMap = {};
            players.forEach(player => {
                playerDetailsMap[player.pid] = {
                    fantasy_player_rating: player.fantasy_player_rating || null,
                    nationality: player.nationality || null,
                    short_name: player.short_name || null
                };
            });

            // Process squads for both teams
            const allPlayers = [
                ...teama.squads.map(player => ({
                    player_id: player.player_id,
                    name: player.name,
                    role: player.role,
                    fantasy_player_rating: playerDetailsMap[player.player_id]?.fantasy_player_rating || null,
                    nationality: playerDetailsMap[player.player_id]?.nationality || null,
                    short_name: playerDetailsMap[player.player_id]?.short_name || null,
                    playing11: player.playing11,
                    substitute: player.substitute,
                    team_id: teama.team_id,
                })),
                ...teamb.squads.map(player => ({
                    player_id: player.player_id,
                    name: player.name,
                    role: player.role,
                    fantasy_player_rating: playerDetailsMap[player.player_id]?.fantasy_player_rating || null,
                    nationality: playerDetailsMap[player.player_id]?.nationality || null,
                    short_name: playerDetailsMap[player.player_id]?.short_name || null,
                    playing11: player.playing11,
                    substitute: player.substitute,
                    team_id: teamb.team_id,
                })),
            ];

            // Bulk update/insert players
            const bulkOps = allPlayers.map(player => ({
                updateOne: {
                    filter: { player_id: player.player_id },
                    update: {
                        $set: { ...player },
                        $addToSet: { match_id: matchId },
                    },
                    upsert: true,
                },
            }));

            await Player.bulkWrite(bulkOps);

            return res.status(200).json({
                success: true,
                message: "Players fetched and saved successfully.",
                players: allPlayers,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No player data found for the given match.",
            });
        }
    } catch (error) {
        console.error("Error fetching players:", error.message);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching players.",
        });
    }
};

exports.createUserTeam = async (req, res) => {
    try {
        const { matchId, players, captain, viceCaptain } = req.body;
        const userId = req.user?.userId;
    
        // Validate the number of players
        if (!Array.isArray(players) || players.length !== 11) {
            return res.status(400).json({ error: 'You must select exactly 11 players' });
        }

        // Validate that the captain and vice-captain are part of the selected players
        if (!players.includes(captain)) {
            return res.status(400).json({ error: 'Captain must be one of the selected players' });
        }
        if (!players.includes(viceCaptain)) {
            return res.status(400).json({ error: 'Vice-captain must be one of the selected players' });
        }

        // Fetch the user details
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate the team name
        const teamCount = await UserTeam.countDocuments({ userId, matchId });
        const teamName = `${user.userName}(T${teamCount + 1})`;

        // Create the team
        const team = new UserTeam({
            userId,
            matchId,
            teamName,
            players,
            captain,
            viceCaptain,
        });
        await team.save();

        res.status(201).json({ message: 'Team created successfully', team });
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserTeam = async function (req, res) {
    try {
        const { matchId } = req.params;
        const userId = req.user.userId;

        // Fetch teams and populate the players field
        const teams = await UserTeam.find({ userId, matchId })

        return res.status(200).json({ message: "Teams fetched successfully", teams });
    } catch (error) {
        console.error("Error fetching teams:", error.message);
        res.status(500).json({ error: error.message });
    }
};


exports.createRazorpayOrder = async function (req, res) {
    try {
      const { amount } = req.body;
  
      if (!amount) {
        return res.status(200).send({ status: false, message: "amount field is required", })
      }
  
      console.log("fdsklajfdklsjfdkldsj")
  
      var instance = new Razorpay({
        key_id: 'rzp_test_7FcETDDAqUcnFu',
        key_secret: 'utSY0U8YmaNjuvEmJ7HBP1XA'
      });
  
      const response = await instance.orders.create({
        "amount": amount * 100,
        "currency": "INR",
      })
  
      console.log(response, "check responseee")
  
      if (response?.status == 'created') {
        return res.status(200).json({ status: true, data: response })
      }
  
      return res.status(200).json({ status: falseeeee, message: "Order not created", })
    } catch (error) {
      console.log(error, "errrorrrrrrrrrr")
      // If an error occurs, send an error response
      return res.status(500).json({ status: false, message: error });
    }
}

exports.joinContest = async function(req, res) {
    try {
        const { _id } = req.body;
        const contest = await Contest.findById(_id);
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
    
        // Check if the contest is full
        if (contest.participants.length >= contest.maxParticipants) {
            return res.status(400).json({ error: 'Contest is full' });
        }
    
        // Add the user to the participants array
        contest.participants.push({ userId: req.user.userId });
    
        // Update leftParticipants: subtract 1 because one participant joined
        contest.leftParticipants = contest.maxParticipants - contest.participants.length;

        await contest.save();
        res.json({ message: 'Joined contest successfully', contest });
    } catch (error) {
        console.error('Error in joinContest API:', error);
        return res.status(500).json({ message: 'An error occurred while joining the contest.', error: error.message });
    }
};

exports.getMatches = async function (req, res) {
    try {
        // Fetch all matches from the database
        const matches = await Match.find();

        // If no matches are found
        if (matches.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Match found.",
            });
        }

        // Return all matches
        return res.status(200).json({
            success: true,
            message: "Matches fetched successfully.",
            matches,
        });
    } catch (error) {
        console.error("Error fetching matches:", error.message);

        // Send error response
        return res.status(500).json({
            success: false,
            message: "Error while fetching matches.",
            error: error.message,
        });
    }
};

exports.getRankAndWinning = async function (req, res) {
    try {
        const { contestId } = req.params;

        // Validate input
        if (!contestId) {
            return res.status(400).json({ message: "Please provide contest ID" });
        }

        // Find the contest
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Fetch the rank and winning details
        const rankAndWinning = contest.rankAndWinning;

        return res.status(200).json({
            success: true,
            message: "Rank and winning details fetched successfully",
            rankAndWinning,
        });
    } catch (error) {
        console.error("Error in getRankAndWinningByContestId API:", error.message);
        return res.status(500).json({ message: "An error occurred while fetching rank and winning details", error: error.message });
    }
};

exports.getLeaderboard = async function (req, res) {
    try {
        const { contestId } = req.params;

        if (!contestId) {
            return res.status(400).json({ message: "Please provide contest ID" });
        }

        const contest = await Contest.findById(contestId).populate('participants.userId', 'name email'); // Populate user details if needed
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Sort participants by rank
        const sortedParticipants = contest.participants.sort((a, b) => a.rank - b.rank);

        // Prepare the leaderboard data
        const leaderboard = sortedParticipants.map(participant => ({
            userId: participant.userId._id,
            name: participant.userId.name, // Assumes the User model has a `name` field
            email: participant.userId.email, // Assumes the User model has an `email` field
            rank: participant.rank,
        }));

        return res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully",
            leaderboard,
        });
    } catch (error) {
        console.error("Error in getLeaderboard API:", error.message);
        return res.status(500).json({ message: "An error occurred while fetching the leaderboard", error: error.message });
    }
};
