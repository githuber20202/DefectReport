const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// דף הבית
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// קבלת נתוני קונפיגורציה (סוגי תקלות ומודולים)
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

// קבלת דיווח התקלה ושמירתו
app.post('/submitBugReport', (req, res) => {
  const { bugType, module, description } = req.body;
  
  const bugReport = {
    bugType,
    module,
    description,
    timestamp: new Date()
  };

  // שמירה לקובץ JSON
  fs.readFile('bugReports.json', (err, data) => {
    let reports = [];
    if (!err) {
        try {
            reports = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ error: "Error parsing bug reports JSON" });
        }
    }
    reports.push(bugReport);
    fs.writeFile('bugReports.json', JSON.stringify(reports, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving report" });
      res.json({ success: true });
    });
  });
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
