const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;
app.use(mysql());
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Jesus@123', 
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


// New PUT route to update user profile
app.put('/api/aairos/:userProfileId', (req, res) => {
    const userProfileId = req.params.userProfileId;
    const updatedProfile = req.body;
  
    // SQL update query
    const query = `
      UPDATE Userprofile
      SET 
        FirstName = ?,
        MiddleName = ?,
        LastName = ?,
        Email = ?,
        DateOfBirth = ?,
        MobileNumber = ?,
        UserName = ?,
        Password = ?,
        Country = ?,
        State = ?,
        City = ?,
        Pincode = ?,
        profileImage = ?
      WHERE UserProfileId = ?
    `;
  
    const values = [
      updatedProfile.FirstName,
      updatedProfile.MiddleName,
      updatedProfile.LastName,
      updatedProfile.Email,
      updatedProfile.DateOfBirth,
      updatedProfile.MobileNumber,
      updatedProfile.UserName,
      updatedProfile.Password,
      updatedProfile.Country,
      updatedProfile.State,
      updatedProfile.City,
      updatedProfile.Pincode,
      updatedProfile.profileImage,
      UserProfileId
    ];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
      res.json({ message: 'Profile updated successfully' });
    });
  });
  
  
  

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
