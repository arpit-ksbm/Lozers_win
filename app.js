const express = require("express");
const app = express();

const db = require("./config/db");
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kycRoutes = require('./routes/kycRoutes');
require('dotenv').config();
const cron = require('node-cron');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

// Connect to MongoDB
db(); // This will now call fetchMatches after successful connection

const PORT = process.env.PORT || 5001;

// Middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors('*'));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/kyc", kycRoutes);

// Schedule cron job to fetch matches every hour
cron.schedule("0 * * * *", () => {
  console.log(`[${new Date().toISOString()}] Running scheduled match fetch...`);
  fetchMatches();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
