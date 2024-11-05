const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'srv1022.hstgr.io', // Replace with your DB_HOST
  user: 'u629519980_root',   // Replace with your DB_USER
  password: 'b1239pot@K', // Replace with your DB_PASSWORD
  database: 'u629519980_credentials' // Replace with your DB_NAME
});

db.getConnection((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL successfully!');
    db.end(); // Close the connection after the test
  }
});
