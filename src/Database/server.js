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
  host: 'localhost',
  user: 'root',
  password: 'Jesus@123',
  database: 'aairos',
});

// Connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// Routes
app.post('/Registation', (req, res) => {
  const { firstName, middleName, lastName, dob, phoneNumber, username, password, email, country, state, city, pincode } = req.body;
  const INSERT_USER_QUERY = `INSERT INTO Registration (FirstName, MiddleName, LastName, DateOfBirth, MobileNumber, UserName, Password, Email, Country, State, City, Pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(INSERT_USER_QUERY, [firstName, middleName, lastName, dob, phoneNumber, username, password, email, country, state, city, pincode], (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).send('Error registering user');
    } else {
      res.send('User registered successfully');
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
