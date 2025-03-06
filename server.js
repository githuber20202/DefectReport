const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); // ✅ הוספת CORS

const app = express();
const port = 3000;

// ✅ הפעלת CORS לכל הבקשות
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// דף הבית
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ✅ API להחזרת הקונפיגורציה
app.get('/config', (req, res) => {
    fs.readFile('config.json', (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading config file" });

        try {
            const config = JSON.parse(data);
            res.json(config);
        } catch (parseError) {
            res.status(500).json({ error: "Error parsing config JSON" });
        }
    });
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
