const db = require('../config/db'); 
const OpenAI = require('openai');
require('dotenv').config(); // Load environment variables from .env file

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

// Function to start a new fact generation game round based on user input category
const startFactRoundWithCategory = async (req, res) => {
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY); // Debugging API key
    const { category } = req.body;

    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    try {
        const prompt = `
            You are an expert in trivia and knowledge. Generate one unique true fact and one plausible but false statement based on the following category: "${category}".
            - The fact should be realistic, detailed, and slightly less obvious.
            - The fiction should be believable but incorrect in a subtle or nuanced way.
            Ensure both statements are engaging, educational, and non-repetitive.
            Format:
            Fact: [True fact]
            Fiction: [False statement]
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,
            temperature: 0.8,  // Increase creativity while retaining realism
            frequency_penalty: 0.5, // Reduce repetition
            presence_penalty: 0.6,  // Encourage diversity in responses
        });

        const output = response.choices[0].message.content.trim().split('\n');
        const fact = output.find((line) => line.startsWith('Fact:')).replace('Fact:', '').trim();
        const fiction = output.find((line) => line.startsWith('Fiction:')).replace('Fiction:', '').trim();

        // Shuffle fact and fiction
        const shuffledStatements = shuffleFactAndFiction(fact, fiction);

        res.json({ statements: shuffledStatements, category });
    } catch (error) {
        console.error('Error generating fact/fiction pair:', error.response?.data || error.message);
        res.status(500).json({ error: 'OpenAI API error' });
    }
};

// Function to validate the player's guess for the fact game
const validateFactGuessWithCategory = (req, res) => {
    const { userId, guess, correctAnswer, score } = req.body;

    if (!userId || !guess || !correctAnswer || score === undefined) {
        return res.status(400).json({ error: 'userId, guess, correctAnswer, and score are required.' });
    }

    const isCorrect = guess.toLowerCase() === correctAnswer.toLowerCase();

    db.query(
        `INSERT INTO scores (user_id, score, date, timestamp) 
         VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'), NOW())`,
        [userId, isCorrect ? score : 0],
        (err) => {
            if (err) {
                console.error('Error inserting score:', err);
                return res.status(500).json({ error: 'Database insert error' });
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

// Function to fetch the user's past scores for the fact game
const getPastFactScores = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

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
                return res.status(404).json({ error: 'No past scores found for this user' });
            }

            res.json({ pastScores: results });
        }
    );
};
// Function to save final score when the game ends
const saveFinalScore = (req, res) => {
    const { userId, finalScore } = req.body;

    if (!userId || finalScore === undefined) {
        return res.status(400).json({ error: 'userId and finalScore are required.' });
    }

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


module.exports = {
    startFactRoundWithCategory,
    validateFactGuessWithCategory,
    getHighScoreFactGame,
    getPastFactScores,
    saveFinalScore,
};
