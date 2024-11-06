const express = require('express');
const router = express.Router();
const { getRandomImage, validateAnswer,saveScore,getHighScore,getPastScores } = require('../controllers/gameController');


router.get('/random-image', getRandomImage);


router.post('/validate-answer', validateAnswer);

router.post('/save-score', saveScore); 

router.get('/high-score/:userId', getHighScore);

router.get('/past-scores/:userId', getPastScores);

module.exports = router;
