const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');

const app = express();

// CORS configuration to allow only specific origin
const corsOptions = {
    origin: 'https://golden-sfogliatella-78043e.netlify.app', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Enable credentials (e.g., cookies, authorization headers)
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
