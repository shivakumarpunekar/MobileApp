// backend/index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/ValveStatus/admin/device/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const query = 'SELECT AdminValveStatus FROM valvestatus WHERE DeviceId = ?';

    db.query(query, [deviceId], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Error fetching status' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(result[0]);
    });
});
