const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'newuser', 
    password: 'NewUserPassword123!', 
    database: 'aairos'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.get('/api/aairos', (req, res) => {
    const userProfileId = req.query.userProfileId;
    const query = 'SELECT * FROM userprofile WHERE UserProfileId = ?';
    db.query(query, [userProfileId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result[0]);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
