const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 8443;


const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

app.get('/api/userprofiles', (req, res) => {
  res.json({ message: 'User profiles fetched successfully' });
});

https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
