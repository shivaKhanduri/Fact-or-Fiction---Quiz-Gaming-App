// server/app.js
const express = require('express');
require('dotenv').config();
const db = require('./config/db');
const cors = require('cors'); // Import cors package

const userRoutes = require('./routes/users'); // User routes
const gameRoutes = require('./routes/game'); // Game routes

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse JSON bodies

// Register routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/game', gameRoutes);   // Game routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
