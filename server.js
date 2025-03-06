const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const XLSX = require('xlsx');

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
    fs.readFile('config.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading config file" });

        try {
            const config = JSON.parse(data);
            res.json(config);
        } catch (parseError) {
            res.status(500).json({ error: "Error parsing config JSON" });
        }
    });
});

// ✅ API לשמירת דיווחים
app.post('/submitBugReport', (req, res) => {
    const { bugType, module, description } = req.body;
    if (!bugType || !module || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const bugReport = { bugType, module, description, timestamp: new Date().toISOString() };
    
    fs.readFile('bugReports.json', 'utf8', (err, data) => {
        let reports = [];
        if (!err && data) {
            try {
                reports = JSON.parse(data);
            } catch (parseError) {
                return res.status(500).json({ error: "Error parsing bugReports.json" });
            }
        }

        reports.push(bugReport);
        fs.writeFile('bugReports.json', JSON.stringify(reports, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error saving report" });
            res.json({ success: true });
        });
    });
});

// ✅ API להורדת Excel
app.get('/downloadExcel', (req, res) => {
    fs.readFile('bugReports.json', 'utf8', (err, data) => {
        let reports = [];
        if (!err && data) {
            try {
                reports = JSON.parse(data);
            } catch (parseError) {
                return res.status(500).json({ error: "Error parsing bugReports.json" });
            }
        }

        const ws = XLSX.utils.json_to_sheet(reports);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bug Reports");

        res.setHeader('Content-Disposition', 'attachment; filename=bugReports.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        res.send(excelBuffer);
    });
});

// ✅ הפעלת השרת
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
