// ✅ server.js - שרת Node.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const port = process.env.PORT || 3000;

// ✅ הגדרות CORS
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// ✅ קובץ קונפיגורציה
const configPath = path.join(__dirname, 'config.json');

// ✅ API לקבלת קונפיגורציה
app.get('/config', (req, res) => {
    fs.readFile(configPath, (err, data) => {
        if (err) return res.status(500).json({ error: "Error loading config" });
        res.json(JSON.parse(data));
    });
});

// ✅ API לשמירת דיווחי תקלות עם תיקון שעה (UTC+2)
const reportsFile = path.join(__dirname, 'bugReports.json');
app.post('/submitBugReport', (req, res) => {
    const { reporterName, systemName, reason, module, description, isBlocking } = req.body;
    if (!reporterName || !systemName || !reason || !module || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // הוספת שעתיים לזמן UTC כדי להתאים לזמן ישראל
    const now = new Date();
    const timestamp = new Date(now.getTime() + (2 * 60 * 60 * 1000)).toISOString();

    const report = { reporterName, systemName, reason, module, description, isBlocking, timestamp };
    
    fs.readFile(reportsFile, (err, data) => {
        let reports = !err && data.length ? JSON.parse(data) : [];
        reports.push(report);
        fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), () => {
            res.json({ success: true });
        });
    });
});

// ✅ API להורדת Excel עם תיקון תאריך לזמן ישראל
app.get('/downloadExcel', (req, res) => {
    fs.readFile(reportsFile, (err, data) => {
        const reports = !err && data.length ? JSON.parse(data) : [];

        // תיקון הזמנים ל-UTC+2
        const adjustedReports = reports.map(report => ({
            ...report,
            timestamp: new Date(new Date(report.timestamp).getTime() + (2 * 60 * 60 * 1000))
                .toISOString().replace("T", " ").substring(0, 19) // הצגת הפורמט הנכון
        }));

        const ws = XLSX.utils.json_to_sheet(adjustedReports);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bug Reports");

        res.setHeader('Content-Disposition', 'attachment; filename=bugReports.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(XLSX.write(wb, { bookType: "xlsx", type: "buffer" }));
    });
});

// ✅ הפעלת השרת
app.listen(port, '0.0.0.0', () => console.log(`Server running at port ${port}`));
