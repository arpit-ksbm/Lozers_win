const Admin = require('../models/adminModel');
const Contest = require('../models/contestModel')
const Match = require('../models/matchModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { fetchMatchesFromAPI } = require('../services/matchServices');
const User = require('../models/userModel');

exports.adminRegister = async function (req, res) {
    try {
        const { email, password } = req.body;

        // Validate if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password",
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists with this email",
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
            return res.status(500).json({
                success: false,
                message: "Error hashing the password",
            });
        }

        // Create new admin user
        const admin = new Admin({
            email,
            password: hashedPassword,
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
        });
    } catch (error) {
        console.error("Error during admin registration:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

exports.adminLogin = async function(req, res) {
    try {
        const { email, password } = req.body;

        // Validate if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password",
            });
        }

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare the provided password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT token for the admin
        const token = jwt.sign(
            { id: admin._id, email: admin.email }, 
            'your_jwt_secret_key',
            { expiresIn: '1h' }
        );

        // Return the token as part of the response
        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
        });
    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

exports.createContest = async (req, res) => {
    const { matchId, teamName, entryFee, prizePool, maxParticipants } = req.body;

    try {
        // Step 1: Validate request body
        if (!matchId || !teamName || !entryFee || !prizePool || !maxParticipants) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Step 2: Fetch match details from cache or API
        let match = await Match.findOne({ matchId });
        if (!match) {
            const matches = await fetchMatchesFromAPI(); // Fetch live matches
            match = matches.find((m) => m.match_id === parseInt(matchId));
            if (!match) {
                return res.status(404).json({
                    success: false,
                    message: "Match not found in database or API.",
                });
            }

            // Cache match locally (if not already cached)
            match = await Match.create({
                matchId: match.match_id,
                title: match.title,
                shortTitle: match.short_title,
                teamA: {
                    name: match.teama?.name || "",
                    shortName: match.teama?.short_name || "",
                    logoUrl: match.teama?.logo_url || "",
                },
                teamB: {
                    name: match.teamb?.name || "",
                    shortName: match.teamb?.short_name || "",
                    logoUrl: match.teamb?.logo_url || "",
                },
                startTime: match.date_start,
                venue: {
                    name: match.venue?.name || "",
                    location: match.venue?.location || "",
                },
                status: match.status_str,
            });
        }

        // Step 3: Create Contest
        const newContest = new Contest({
            matchId,
            matchDetails: {
                title: match.title,
                shortTitle: match.shortTitle || match.short_title,
                teamA: {
                    name: match.teamA?.name || match.teama?.name,
                    shortName: match.teamA?.shortName || match.teama?.short_name,
                    logoUrl: match.teamA?.logoUrl || match.teama?.logo_url,
                },
                teamB: {
                    name: match.teamB?.name || match.teamb?.name,
                    shortName: match.teamB?.shortName || match.teamb?.short_name,
                    logoUrl: match.teamB?.logoUrl || match.teamb?.logo_url,
                },
                startTime: match.startTime || match.date_start,
                venue: match.venue,
            },
            teamName,
            entryFee,
            prizePool,
            maxParticipants,
        });

        await newContest.save();

        // Step 4: Send response
        return res.status(201).json({
            success: true,
            message: "Contest created successfully.",
            contest: newContest,
        });
    } catch (error) {
        console.error("Error creating contest:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error while creating contest.",
        });
    }
};

exports.editContest = async function (req, res) {
    const { _id } = req.params;
    const { teamName, entryFee, prizePool, maxParticipants } = req.body;

    try {
        // Step 1: Validate contest ID
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Contest ID is required.",
            });
        }

        // Step 2: Find the contest
        const contest = await Contest.findById(_id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found.",
            });
        }

        // Step 3: Update contest details
        if (teamName) contest.teamName = teamName;
        if (entryFee) contest.entryFee = entryFee;
        if (prizePool) contest.prizePool = prizePool;
        if (maxParticipants) contest.maxParticipants = maxParticipants;

        // Step 4: Save the updated contest
        await contest.save();

        // Step 5: Send response
        return res.status(200).json({
            success: true,
            message: "Contest updated successfully.",
            contest,
        });
    } catch (error) {
        console.error("Error updating contest:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error while updating contest.",
        });
    }
};

exports.deleteContest = async function (req, res) {
    const { _id } = req.params;

    try {
        // Step 1: Validate contest ID
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Contest ID is required.",
            });
        }

        // Step 2: Find the contest
        const contest = await Contest.findById(_id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found.",
            });
        }

        // Step 3: Delete the contest
        await contest.deleteOne();

        // Step 4: Send response
        return res.status(200).json({
            success: true,
            message: "Contest deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting contest:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error while deleting contest.",
        });
    }
};

exports.getAllContest = async function (req, res) {
    try {
        // Fetch all contests from the database
        const contests = await Contest.find();

        // If no contests are found
        if (contests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No contests found.",
            });
        }

        // Return all contests
        return res.status(200).json({
            success: true,
            message: "Contests fetched successfully.",
            contests,
        });
    } catch (error) {
        console.error("Error fetching contests:", error.message);

        // Send error response
        return res.status(500).json({
            success: false,
            message: "Error while fetching contests.",
            error: error.message,
        });
    }
};

exports.getAllUsers = async function (req, res) {
    try {
        // Fetch all contests from the database
        const users = await User.find();

        // If no contests are found
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found.",
            });
        }

        // Return all contests
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            users,
        });
    } catch (error) {
        console.error("Error fetching contests:", error.message);

        // Send error response
        return res.status(500).json({
            success: false,
            message: "Error while fetching contests.",
            error: error.message,
        });
    }
};



