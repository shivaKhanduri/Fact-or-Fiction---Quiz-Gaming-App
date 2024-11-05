const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticateToken = require('../middleware/auth');

// Route to get a random image
router.get('/random-image', authenticateToken, (req, res) => {
  gameController.getRandomImage(req, res);
});

// Route to validate the user's answer
router.post('/validate-answer', authenticateToken, (req, res) => {
  gameController.validateAnswer(req, res);
});

module.exports = router;