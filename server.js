const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const port = process.env.PORT || 3000;

// ✅ הגדרות CORS
app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const configPath = path.join(__dirname, 'config.json');
const reportsFile = path.join(__dirname, 'bugReports.json');

// ✅ API לקבלת קובץ הקונפיגורציה
app.get('/config', (req, res) => {
    fs.readFile(configPath, (err, data) => {
        if (err) return res.status(500).json({ error: "Error loading config" });
        res.json(JSON.parse(data));
    });
});

// ✅ API לשמירת דיווחי תקלות (עד 100 רשומות אחרונות)
app.post('/submitBugReport', (req, res) => {
    const report = { ...req.body, timestamp: new Date().toISOString() };

    fs.readFile(reportsFile, (err, data) => {
        let reports = !err && data.length ? JSON.parse(data) : [];
        reports.push(report);
        if (reports.length > 100) {
            reports = reports.slice(-100);
        }

        fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), (err) => {
    if (err) {
        console.error("שגיאה בכתיבת הקובץ:", err);
        return res.status(500).json({ error: "Failed to save report" });
    }
    res.json({ success: true });
        });
    });
});

// ✅ API להורדת Excel עם זמן מתוקן לישראל
app.get('/downloadExcel', (req, res) => {
    fs.readFile(reportsFile, (err, data) => {
        let reports = !err && data.length ? JSON.parse(data) : [];

        const adjustedReports = reports.map(report => {
            const utcDate = new Date(report.timestamp);
            const offset = new Date().getTimezoneOffset() === -180 ? 3 : 2;
            const localDate = new Date(utcDate.getTime() + (offset * 60 * 60 * 1000));

            return {
                ...report,
                timestamp: localDate.toISOString().replace("T", " ").substring(0, 19)
            };
        });

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
