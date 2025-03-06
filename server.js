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

// קבלת דיווח התקלה
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
    if (err) throw err;
    let reports = JSON.parse(data);
    reports.push(bugReport);
    fs.writeFile('bugReports.json', JSON.stringify(reports, null, 2), (err) => {
      if (err) throw err;
      res.json({ success: true });
    });
  });
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
