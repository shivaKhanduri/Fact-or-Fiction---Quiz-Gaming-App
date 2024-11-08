// server/app.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
