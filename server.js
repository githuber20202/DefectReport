const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); 
const XLSX = require('xlsx');

const app = express();
const port = 3000;

// ✅ הפעלת CORS
app.use(cors());

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ דף הבית
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// ✅ API להחזרת הקונפיגורציה
app.get('/config', (req, res) => {
    fs.readFile('config.json', (err, data) => {
        if (err) {
            console.error("❌ Error reading config file:", err);
            return res.status(500).json({ error: "Error reading config file" });
        }
        try {
            const config = JSON.parse(data);
            res.json(config);
        } catch (parseError) {
            console.error("❌ Error parsing config JSON:", parseError);
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

    const bugReport = { 
        bugType: bugType.trim(), 
        module: module.trim(), 
        description: description.trim(), 
        timestamp: new Date().toISOString() 
    };

    fs.readFile('bugReports.json', (err, data) => {
        let reports = [];
        if (!err && data.length) {
            try {
                reports = JSON.parse(data);
            } catch (parseError) {
                console.error("❌ Error parsing bugReports.json:", parseError);
                return res.status(500).json({ error: "Error parsing bug reports file" });
            }
        }

        // ✅ בדיקה אם התקלה כבר קיימת, תוך התחשבות ברווחים ורגישות אותיות
        const exists = reports.some(report =>
            report.bugType.toLowerCase() === bugReport.bugType.toLowerCase() &&
            report.module.toLowerCase() === bugReport.module.toLowerCase() &&
            report.description.toLowerCase() === bugReport.description.toLowerCase()
        );

        if (exists) {
            return res.status(409).json({ error: "Duplicate report detected" });
        }

        reports.push(bugReport);
        fs.writeFile('bugReports.json', JSON.stringify(reports, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("❌ Error writing to bugReports.json:", writeErr);
                return res.status(500).json({ error: "Error saving bug report" });
            }
            res.json({ success: true });
        });
    });
});

// ✅ API להורדת Excel
app.get('/downloadExcel', (req, res) => {
    fs.readFile('bugReports.json', (err, data) => {
        let reports = [];
        if (!err && data.length) {
            try {
                reports = JSON.parse(data);
            } catch (parseError) {
                console.error("❌ Error parsing bugReports.json:", parseError);
                return res.status(500).json({ error: "Error parsing bug reports file" });
            }
        }

        if (reports.length === 0) {
            return res.status(404).json({ error: "No reports found" });
        }

        // ✅ יצירת קובץ Excel מסודר
        const ws = XLSX.utils.json_to_sheet(reports, {
            header: ["bugType", "module", "description", "timestamp"]
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bug Reports");

        res.setHeader('Content-Disposition', 'attachment; filename=bugReports.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(XLSX.write(wb, { bookType: "xlsx", type: "buffer" }));
    });
});

// ✅ הפעלת השרת
app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));
