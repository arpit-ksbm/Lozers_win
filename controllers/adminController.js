const Admin = require('../models/adminModel');
const Contest = require('../models/contestModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

exports.createContest = async function (req, res) {
    const { matchId, contestType, entryFee, prizePool, maxParticipants, prizeDistribution } = req.body;

    try {
        // Validate if the match exists
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found.",
            });
        }

        // Validate prize distribution
        let totalPrize = 0;
        Object.values(prizeDistribution).forEach(prize => {
            totalPrize += prize;
        });
        
        if (totalPrize > prizePool) {
            return res.status(400).json({
                success: false,
                message: "Total prize distribution exceeds prize pool.",
            });
        }

        // Create a new contest
        const newContest = new Contest({
            matchId,
            contestType,
            entryFee,
            prizePool,
            maxParticipants,
            prizeDistribution
        });

        await newContest.save();

        return res.status(201).json({
            success: true,
            message: "Contest created successfully.",
            contest: newContest
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the contest.",
        });
    }
}