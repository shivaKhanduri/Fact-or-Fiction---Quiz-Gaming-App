const express = require('express');
const router = express.Router();
const { 
    startFactRoundWithCategory, 
    validateFactGuessWithCategory, 
    getHighScoreFactGame, 
    getPastFactScores,
    saveFinalScore,
} = require('../controllers/factGameController');

// Debugging: Check if controllers are correctly imported
console.log('factGameController Methods:', {
    startFactRoundWithCategory,
    validateFactGuessWithCategory,
    getHighScoreFactGame,
    getPastFactScores,
});

// Routes for the Fact Generation Game
router.get('/fact-past-scores/:userId', getPastFactScores);
router.post('/save-final-score', saveFinalScore);
router.post('/start-fact-round', startFactRoundWithCategory); // Start new fact game round based on category
router.post('/validate-fact-guess', validateFactGuessWithCategory); // Validate fact game guess
router.get('/fact-high-score/:userId', getHighScoreFactGame); // Get high score for fact game
router.get('/fact-past-scores/:userId', getPastFactScores); // Get past scores for fact game

module.exports = router; // Ensure you're exporting the router
