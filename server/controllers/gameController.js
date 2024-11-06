const db = require('../config/db');

// Function to get a random image
const getRandomImage = (req, res) => {
    db.query('SELECT id, image_url FROM images ORDER BY RAND() LIMIT 1', (err, results) => {
        if (err) {
            console.error('Error fetching random image:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No images found' });
        }

        res.json({ 
            imageUrl: results[0].image_url, 
            imageId: results[0].id // Include image ID for answer validation
        });
    });
};

// Function to validate the user's answer
const validateAnswer = (req, res) => {
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
};


const saveScore = (req, res) => {
  const { userId, score } = req.body;

  if (!userId || score === undefined) {
      return res.status(400).json({ error: 'userId and score are required' });
  }

  // Insert the score into the 'scores' table (past scores)
  db.query('INSERT INTO scores (user_id, score, date) VALUES (?, ?, NOW())', [userId, score], (err) => {
      if (err) {
          console.error('Error inserting past score:', err);
          return res.status(500).json({ error: 'Database insert error' });
      }

      // Update high score in the 'users' table if the new score is higher
      db.query('UPDATE users SET high_score = GREATEST(high_score, ?) WHERE id = ?', [score, userId], (err) => {
          if (err) {
              console.error('Error updating high score:', err);
              return res.status(500).json({ error: 'Database update error' });
          }

          res.json({ message: 'Score and high score updated successfully!' });
      });
  });
};

const getHighScore = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
  }

  db.query('SELECT high_score FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
          console.error('Error fetching high score:', err);
          return res.status(500).json({ error: 'Database query error' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json({ highScore: results[0].high_score });
  });
};

const getPastScores = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
  }

  db.query('SELECT score, date FROM scores WHERE user_id = ? ORDER BY date DESC', [userId], (err, results) => {
      if (err) {
          console.error('Error fetching past scores:', err);
          return res.status(500).json({ error: 'Database query error' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'No past scores found for this user' });
      }

      res.json({ pastScores: results });
  });
};

module.exports = { getRandomImage, validateAnswer, saveScore, getHighScore,getPastScores };
