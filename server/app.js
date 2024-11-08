const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');

const app = express();

// CORS configuration to allow only specific origin
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
};


app.use(cors(corsOptions)); // Apply CORS middleware
app.use(express.json()); // Parse incoming JSON requests

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
