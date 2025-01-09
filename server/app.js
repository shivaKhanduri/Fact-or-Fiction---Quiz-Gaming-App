const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');
const factGameRoutes = require('./routes/factGame'); // Fact game routes

const app = express();

// Debugging: Verify imported routes
console.log('userRoutes:', typeof userRoutes);
console.log('gameRoutes:', typeof gameRoutes);
console.log('factGameRoutes:', typeof factGameRoutes);

// CORS configuration to allow only specific origin
const corsOptions = {
    origin: 'https://golden-sfogliatella-78043e.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
};

app.use(cors(corsOptions)); // Apply CORS middleware
app.use(express.json()); // Parse incoming JSON requests

// Register routes
app.use('/api/users', userRoutes); // Debug
console.log('userRoutes registered at /api/users');

app.use('/api/game', gameRoutes); // Debug
console.log('gameRoutes registered at /api/game');

app.use('/api/factgame', factGameRoutes); // Fact game route
console.log('factGameRoutes registered at /api/factgame');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
