const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',      // Your MySQL host (e.g., localhost)
  user: 'root',           // Your MySQL username
  password: 'Jesus@123', // Your MySQL password
  database: 'aairos', // Your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// Example route
app.get('/userprofile', (req, res) => {
  const SELECT_ALL_USERS_QUERY = 'SELECT * FROM userprofile'; 
  db.query(SELECT_ALL_USERS_QUERY, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
