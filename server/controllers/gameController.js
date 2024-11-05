// server/controllers/gameController.js
const db = require('../config/db');

exports.getRandomImage = (req, res) => {
  console.log('Fetching a random image');
  db.query('SELECT * FROM images ORDER BY RAND() LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error fetching random image:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }
    res.json({ imageUrl: results[0].image_url, answer: results[0].correct_answer });
  });
};

exports.validateAnswer = (req, res) => {
  console.log('Validating answer for imageId:', req.body.imageId);
  const { imageId, userAnswer } = req.body;

  if (!imageId || !userAnswer) {
    return res.status(400).json({ error: 'imageId and userAnswer are required' });
  }

  db.query('SELECT correct_answer FROM images WHERE id = ?', [imageId], (err, results) => {
    if (err) {
      console.error('Error validating answer:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const isCorrect = results[0].correct_answer.toLowerCase() === userAnswer.toLowerCase();
    res.json({ isCorrect });
  });
}