const db = require('../config/db'); 
const OpenAI = require('openai');
require('dotenv').config(); // Load environment variables from .env file
const jwt = require('jsonwebtoken');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load API key from environment variables
});

// Utility function to shuffle fact and fiction
const shuffleFactAndFiction = (fact, fiction) => {
    const statements = [
        { text: fact, type: 'fact' },
        { text: fiction, type: 'fiction' },
    ];
    // Shuffle array using Fisher-Yates algorithm
    for (let i = statements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [statements[i], statements[j]] = [statements[j], statements[i]];
    }
    return statements;
};

 // To store recently used facts for each user session

 const startFactRoundWithCategory = async (req, res) => {
    const { category, userId } = req.body; // Destructure category and userId from the request body

    if (!category || category.trim().length === 0) {
        return res.status(400).json({ error: 'Category is required and cannot be empty.' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        console.log(`Starting fact round for user: ${userId}, category: ${category}`);

        const prompt = `
            You are a trivia expert tasked with generating a challenging trivia question for a fact or fiction game. 
            Generate a unique, non-repetitive true fact and a plausible but incorrect statement related to "${category}". 
            The fact should be obscure and interesting to challenge the player. Avoid using simple or well-known facts.
            Format:
            Fact: [True fact]
            Fiction: [False statement]
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,
            temperature: 0.8,
            frequency_penalty: 0.7,
            presence_penalty: 0.6,
        });

        const output = response.choices[0].message.content.trim().split('\n');
        const fact = output.find((line) => line.startsWith('Fact:'))?.replace('Fact:', '').trim();
        const fiction = output.find((line) => line.startsWith('Fiction:'))?.replace('Fiction:', '').trim();

        if (!fact || !fiction) {
            return res.status(500).json({ error: 'Failed to extract fact/fiction from AI response.' });
        }

        res.json({ statements: shuffleFactAndFiction(fact, fiction), category });
    } catch (error) {
        console.error('Error generating fact/fiction:', error);
        res.status(500).json({ error: 'Failed to generate fact/fiction.' });
    }
};




// Function to validate the player's guess for the fact game
const validateFactGuessWithCategory = (req, res) => {
    console.log('Request payload:', req.body); // Log incoming payload for debugging

    const { userId, guess, correctAnswer, score } = req.body;

    // Validate inputs
    if (!userId) return res.status(400).json({ error: 'Missing userId.' });
    if (!guess) return res.status(400).json({ error: 'Missing guess.' });
    if (!correctAnswer) return res.status(400).json({ error: 'Missing correctAnswer.' });
    if (typeof score !== 'number') return res.status(400).json({ error: 'Score must be a valid number.' });

    const isCorrect = guess.toLowerCase() === correctAnswer.toLowerCase();
    const assignedScore = isCorrect ? score : 0;

    console.log(`Validating guess for userId: ${userId}`);
    console.log(`Guess: ${guess}, Correct Answer: ${correctAnswer}, Score: ${assignedScore}`);

    db.query(
        `INSERT INTO scores (user_id, score, date, timestamp) 
         VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'), NOW())`,
        [userId, assignedScore],
        (err) => {
            if (err) {
                console.error('Database error:', err.code, err.sqlMessage);
                return res.status(500).json({ error: 'Failed to insert score into the database.' });
            }

            res.json({ message: isCorrect ? 'Correct!' : 'Incorrect.', isCorrect });
        }
    );
};
// Function to fetch the user's high score for the fact game
const getHighScoreFactGame = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    db.query(
        'SELECT MAX(score) AS high_score FROM scores WHERE user_id = ?',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching high score from scores table:', err);
                return res.status(500).json({ error: 'Database query error' });
            }

            if (results.length === 0 || results[0].high_score === null) {
                return res.status(404).json({ error: 'No scores found for this user' });
            }

            res.json({ highScore: results[0].high_score });
        }
    );
};


// Function to save final score when the game ends
const saveFinalScore = (req, res) => {
    console.log('Request payload:', req.body); // Log the request payload for debugging

    const { userId, finalScore } = req.body;

    // Validate inputs
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId.' });
    }

    if (finalScore === undefined || typeof finalScore !== 'number') {
        return res.status(400).json({ error: 'Missing or invalid finalScore. It must be a number.' });
    }

    console.log(`Saving final score for userId: ${userId}, score: ${finalScore}`);

    db.query(
        `INSERT INTO scores (user_id, score, date, timestamp) 
         VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'), NOW())`,
        [userId, finalScore],
        (err) => {
            if (err) {
                console.error('Error saving final score:', err);
                return res.status(500).json({ error: 'Database insert error' });
            }

            res.json({ message: 'Final score saved successfully.' });
        }
    );
};

const getPastFactScores = (req, res) => {
    const { userId } = req.params;

    // Validate inputs
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    console.log(`Fetching past scores for userId: ${userId}`);

    db.query(
        `SELECT 
           score, 
           DATE_FORMAT(timestamp, '%d/%m/%Y %H:%i:%s') AS date 
         FROM scores 
         WHERE user_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 10`,
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching past scores:', err);
                return res.status(500).json({ error: 'Database query error' });
            }

            if (results.length === 0) {
                console.log(`No past scores found for userId: ${userId}`);
                return res.status(404).json({ error: 'No past scores found for this user.' });
            }

            console.log(`Past scores for userId: ${userId}`, results);
            res.json({ pastScores: results });
        }
    );
};


const getLeaderboard = (req, res) => {
    db.query(
        `SELECT users.username, MAX(scores.score) AS high_score
         FROM scores
         JOIN users ON scores.user_id = users.id
         GROUP BY users.username
         ORDER BY high_score DESC
         LIMIT 10`,
        (err, results) => {
            if (err) {
                console.error('Error fetching leaderboard:', err);
                return res.status(500).json({ error: 'Database query error' });
            }

            res.status(200).json(results);
        }
    );
};


module.exports = {
    getPastFactScores,
    getLeaderboard,
    startFactRoundWithCategory,
    validateFactGuessWithCategory,
    getHighScoreFactGame,
    saveFinalScore,
};
