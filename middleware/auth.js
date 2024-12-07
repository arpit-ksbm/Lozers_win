const jwt = require('jsonwebtoken');

// Middleware to authenticate the user
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    jwt.verify(token, process.env.JWT, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
        req.user = decoded; // Add user info to request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;
