// server/controllers/userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Ensure you require jsonwebtoken for JWT handling
const db = require('../config/db');

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  console.log('Registering user:', { username, password });

  try {
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query('INSERT INTO users (username, password, high_score) VALUES (?, ?, ?)', [
      username,
      hashedPassword,
      0,
    ]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  console.log('Logging in user:', { username });

  try {
    // Check if user exists
    const [user] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = { registerUser, loginUser }; // Ensure both functions are exported
