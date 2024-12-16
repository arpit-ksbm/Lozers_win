const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel')

// Middleware to authenticate the admin
const authenticateAdminToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Admin authentication required",
        });
    }

    jwt.verify(token, process.env.JWT, async (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired admin token",
            });
        }

        // Check if the token belongs to an admin
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized admin access",
            });
        }

        req.admin = decoded; // Add admin info to request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateAdminToken;
