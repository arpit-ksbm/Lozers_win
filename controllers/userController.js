const { log } = require('console');
const configureMulter = require('../configureMulter');
const User = require('../models/userModel');
const crypto = require('crypto');
const multer = require("multer");

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

        res.status(200).json({
            success: true,
            message: "OTP generated successfully",
            otp:user.otp,
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

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            user,
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
