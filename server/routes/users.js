// server/routes/users.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// POST request to register a new user
router.post('/register', registerUser);

// POST request to log in a user
router.post('/login', loginUser); // Ensure this line exists

module.exports = router;
