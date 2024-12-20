const Admin = require("../models/adminModel");
const Contest = require("../models/contestModel");
const Match = require("../models/matchModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { fetchMatchesFromAPI } = require("../services/matchService");
const User = require("../models/userModel");
const withdrawModel = require("../models/withdrawRequestModel");
const transactionModel = require("../models/transactionModel");
const Points = require('../models/fantasyPointsModel')

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

exports.adminLogin = async function (req, res) {
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
      { id: admin._id, email: admin.email, role: "admin" }, // Include role in the token payload
      process.env.JWT,
      { expiresIn: "1h" }
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

exports.changePassword = async function (req, res) {
  try {
    const { currentPassword, newPassword, adminId } = req.body;

    if (!currentPassword || !newPassword || !adminId) {
      return Error(
        res,
        -1,
        400,
        "Admin ID, current password, and new password must be provided"
      );
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (newPassword.length < 6) {
      return Error(
        res,
        -1,
        400,
        "New password must be at least 6 characters long"
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedNewPassword;
    await admin.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while changing the password" });
  }
};

exports.createContest = async (req, res) => {
  const {
    matchId,
    contestName,
    entryFee,
    prizePool,
    maxParticipants,
    discount,
  } = req.body;

  try {
    // Step 1: Validate request body
    if (
      !matchId ||
      !contestName ||
      !entryFee ||
      !prizePool ||
      !maxParticipants
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields matchId, contestName, entryFee, prizePool, maxParticipants are required.",
      });
    }

    // Step 2: Check if the match exists
    const match = await Match.findOne({ match_id: matchId });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found for the given matchId.",
      });
    }

    // Step 4: Create Contest
    const newContest = new Contest({
      matchId,
      contestName,
      entryFee,
      prizePool,
      maxParticipants,
      discount,
    });

    await newContest.save();

    // Step 5: Send response
    return res.status(201).json({
      success: true,
      message: "Contest created successfully.",
      contest: newContest,
    });
  } catch (error) {
    console.error("Error creating contest:", error.message);

    // Send error response
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the contest.",
      error: error.message,
    });
  }
};

exports.editContest = async function (req, res) {
  const { _id } = req.params;
  const { contestName, entryFee, prizePool, maxParticipants } = req.body;

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
    if (contestName) contest.contestName = contestName;
    if (entryFee) contest.entryFee = entryFee;
    if (prizePool) contest.prizePool = prizePool;

    // Update maxParticipants and leftParticipants
    if (maxParticipants) {
      contest.maxParticipants = maxParticipants;
      contest.leftParticipants = maxParticipants - contest.participants.length;
    }

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

exports.updateUserStatus = async function (req, res) {
  try {
    const { _id } = req.params; // Extract user ID from route params
    const { status } = req.body; // Extract status from the request body

    // Validate input
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!["Active", "In-Active"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses are 'Active' and 'In-Active'.",
      });
    }

    // Find the user in the database
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update the user's status
    user.status = status;
    const updatedUser = await user.save();

    // Success response
    return res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating user status.",
      error: error.message,
    });
  }
};

exports.addRankAndWinningByContestId = async function (req, res) {
  try {
    const { contestId, rankAndWinning } = req.body;

    if (!contestId) {
      return res.status(400).json({ message: "Please provide contest ID" });
    }
    if (!rankAndWinning || !Array.isArray(rankAndWinning)) {
      return res
        .status(400)
        .json({
          message:
            "Please provide rank and winning details in the correct format",
        });
    }

    // Find the contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Update the rank and winning details
    contest.rankAndWinning = rankAndWinning;

    // Save the updated contest
    await contest.save();

    return res.status(200).json({
      success: true,
      message: "Rank and winning details added successfully",
      contest,
    });
  } catch (error) {
    console.error("Error in addRankAndWinningByContestId API:", error.message);
    return res
      .status(500)
      .json({
        message: "An error occurred while adding rank and winning details",
        error: error.message,
      });
  }
};

exports.adminDashboard = async function (req, res) {
  try {
    const users = await User.countDocuments();
    const activeUser = await User.countDocuments({ status: "Active" });
    const withdraws = await withdrawModel.find({ status: "Approved" });
    const transaction = await transactionModel.find();

    // Calculate the total withdrawal amount
    const totalWithdraw = withdraws.reduce(
      (total, withdraw) => total + (withdraw.amount || 0),
      0
    );

    // Calculate the total deposit amount
    const totalDeposit = transaction.reduce(
      (total, deposit) => total + (deposit.amount || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        users,
        activeUser,
        totalWithdraw,
        totalDeposit,
      },
    });
  } catch (error) {
    console.error("Error in adminDashboard:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getPoints = async function (req, res) {
    try {
        const points = await Points.find({});

        return res.status(200).json({success: true,message:"Points fetched successfully",points})
    } catch (error) {
        console.error("Error in adminDashboard:", error.message);
    }
}
exports.updatePoints = async function (req, res) {
  try {
    const pointsId = '67640f623dab3ae42c8608bf'; // Replace with dynamic ID if needed
    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Please provide an object with updates.",
      });
    }

    // Build the $set object dynamically for partial updates
    const updateFields = {};
    for (const [key, value] of Object.entries(updates)) {
      for (const [subKey, subValue] of Object.entries(value)) {
        updateFields[`${key}.${subKey}`] = subValue;
      }
    }

    // Update the points object
    const updatedPoints = await Points.findByIdAndUpdate(
      pointsId,
      { $set: updateFields }, // Apply partial updates
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    if (!updatedPoints) {
      return res.status(404).json({
        success: false,
        message: "Points object not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Points updated successfully.",
      points: updatedPoints,
    });
  } catch (error) {
    console.error("Error in updatePoints:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating points.",
    });
  }
};

