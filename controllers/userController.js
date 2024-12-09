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
const UserTeam = require("../models/userTeamModel");

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

        // Create expiration time for OTP (e.g., 5 minutes from now)
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

        // Generate JWT token (this will be sent after OTP verification)
        // const token = jwt.sign({ userId: user._id }, process.env.JWT , { expiresIn: '1h' });

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
        user.otp = null; // Clear OTP after verification
        user.otpExpiry = null; // Clear OTP expiry time
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
            const { _id, name, dateOfBirth, gender, address } = req.body;

            // Check if the required fields are provided
            if (!_id) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }

            // Find the user by ID
            let user = await User.findById(_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Update other user details
            if (name) user.name = name;
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
        const { matchId } = req.body;

        // Check if matchId is provided
        if (!matchId) {
            return res.status(400).json({
                success: false,
                message: "Match ID is required"
            });
        }

        // Fetch all contests from the database
        const contests = await Contest.find({ matchId });

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
            contests
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
        const { matchId } = req.body;

        if (!matchId) {
            return res.status(400).json({
                success: false,
                message: "Match ID is required.",
            });
        }

        // Fetch data from Entitysport API
        const { data } = await axios.get(
            `https://rest.entitysport.com/v2/matches/${matchId}/squads/?token=ec471071441bb2ac538a0ff901abd249`
        );

        if (data.status === "ok" && data.response) {
            const { teama, teamb } = data.response;

            // Combine both teams' players
            const allPlayers = [
                ...teama.squads.map(player => ({
                    player_id: player.player_id,
                    name: player.name,
                    role: player.role,
                    playing11: player.playing11 === "true",
                    team_id: teama.team_id,
                    match_id: matchId,
                })),
                ...teamb.squads.map(player => ({
                    player_id: player.player_id,
                    name: player.name,
                    role: player.role,
                    playing11: player.playing11 === "true",
                    team_id: teamb.team_id,
                    match_id: matchId,
                })),
            ];

            // Save players to the database
            await Player.insertMany(allPlayers, { ordered: false });

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
        const { userId, matchId, contestId, players } = req.body;

        // Validate inputs
        if (!userId || !matchId || !contestId || !players || players.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User ID, Match ID, Contest ID, and Players are required.",
            });
        }

        if (players.length > 11) {
            return res.status(400).json({
                success: false,
                message: "You can select a maximum of 11 players only.",
            });
        }

        // Verify players exist in the database for the given match
        // const validPlayers = await Player.find({
        //     match_id: matchId,
        //     player_id: { $in: players },
        // });

        // if (validPlayers.length !== players.length) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Some selected players are invalid or not part of the match.",
        //     });
        // }

        // Save user's team (no check for existing team, allowing multiple teams per contest)
        const team = new UserTeam({
            userId,
            matchId,
            contestId,
            players,
        });

        await team.save();

        return res.status(201).json({
            success: true,
            message: "User team created successfully.",
            team,
        });
    } catch (error) {
        console.error("Error creating user team:", error.message);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the team.",
            error: error.message,
        });
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
        const { matchId, contestId, userId } = req.body;

        // Validate request
        if (!matchId || !contestId || !userId) {
            return res.status(400).json({ message: 'matchId, contestId, and userId are required.' });
        }

        // Fetch the contest
        const contest = await Contest.findById(contestId);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }

        // Check if contest is full
        if (contest.participants.length >= contest.maxParticipants) {
            return res.status(400).json({ message: 'Contest is full. You cannot join this contest.' });
        }

        // Check if user is already a participant
        const isAlreadyParticipant = contest.participants.some(
            (participant) => participant.userId.toString() === userId
        );

        if (isAlreadyParticipant) {
            return res.status(400).json({ message: 'You have already joined this contest.' });
        }

        // Add the user to the contest's participants
        contest.participants.push({ userId });

        // Save the updated contest
        await contest.save();

        return res.status(200).json({ message: 'Successfully joined the contest.', contest });
    } catch (error) {
        console.error('Error in joinContest API:', error);
        return res.status(500).json({ message: 'An error occurred while joining the contest.', error: error.message });
    }
};

