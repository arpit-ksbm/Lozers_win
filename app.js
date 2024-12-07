const express = require("express");
const app = express();

const db = require("./config/db");
const cors = require("cors");
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
require('dotenv').config()
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const { initializeSocketIO } = require("./socket/service");
const { urlencoded } = require("body-parser");
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: "*"
//   }
// });

const PORT = process.env.PORT || 5001;

// app.use(helmet());

// Set Referrer-Policy to strict-origin-when-cross-origin
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.static(__dirname + ""));
app.use(express.json());// Parse incoming requests with JSON payloads
app.use(express.urlencoded({ extended: false }));
app.use(cors('*'));
db();

// // Define the API routes


// initializeSocketIO(io)
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
