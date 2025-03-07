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

// ✅ API לשמירת דיווחי תקלות - שמירת UTC בלבד
const reportsFile = path.join(__dirname, 'bugReports.json');
app.post('/submitBugReport', (req, res) => {
    const { reporterName, systemName, reason, module, description, isBlocking } = req.body;
    if (!reporterName || !systemName || !reason || !module || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // ✔ שמירת השעה ב-UTC בלבד (ללא תיקון)
    const timestamp = new Date().toISOString();

    const report = { reporterName, systemName, reason, module, description, isBlocking, timestamp };
    
    fs.readFile(reportsFile, (err, data) => {
        let reports = !err && data.length ? JSON.parse(data) : [];
        reports.push(report);
        fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), () => {
            res.json({ success: true });
        });
    });
});

// ✅ API להורדת Excel עם המרת שעה לזמן ישראל (UTC+2 או UTC+3)
app.get('/downloadExcel', (req, res) => {
    fs.readFile(reportsFile, (err, data) => {
        const reports = !err && data.length ? JSON.parse(data) : [];

        // המרת UTC לזמן ישראל (בודק האם בקיץ או חורף)
        const adjustedReports = reports.map(report => {
            const utcDate = new Date(report.timestamp);
            
            // בדיקת הפרש הזמן בין UTC לישראל (זמן קיץ או חורף)
            const offset = (new Date().getTimezoneOffset() === -180) ? 3 : 2; // UTC+3 בקיץ, UTC+2 בחורף
            utcDate.setHours(utcDate.getHours() + offset);
            
            return {
                ...report,
                timestamp: utcDate.toISOString().replace("T", " ").substring(0, 19) // הצגת התאריך בלי Z
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
