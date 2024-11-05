// server/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections to create at once
  queueLimit: 0, // Unlimited number of requests can wait for a connection
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  // Release the connection back to the pool
  connection.release();
});

// Export the pool
module.exports = db;
