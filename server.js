const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const XLSX = require('xlsx');

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send("Server is running! 🚀");
});

app.get('/config', (req, res) => {
    fs.readFile('config.json', 'utf8', (err, data) => {
        if (err) {
            console.error("❌ Error reading config.json, sending default config.");
            return res.json({ "apiBaseUrl": "https://defectreport.onrender.com" });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/submitBugReport', (req, res) => {
    const { bugType, module, description } = req.body;

    if (!bugType || !module || !description) {
        return res.status(400).json({ error: "❌ All fields are required" });
    }

    const bugReport = { bugType, module, description, timestamp: new Date().toISOString() };

    fs.readFile('bugReports.json', 'utf8', (err, data) => {
        let reports = [];
        if (!err && data) {
            try {
                reports = JSON.parse(data);
            } catch (parseError) {
                console.error("❌ Error parsing bugReports.json, resetting file.");
                reports = [];
            }
        }

        reports.push(bugReport);
        fs.writeFile('bugReports.json', JSON.stringify(reports, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "❌ Error saving report" });
            res.json({ success: true });
        });
    });
});

app.get('/downloadExcel', (req, res) => {
    fs.readFile('bugReports.json', 'utf8', (err, data) => {
        let reports = !err && data ? JSON.parse(data) : [];
        const ws = XLSX.utils.json_to_sheet(reports);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bug Reports");

        res.setHeader('Content-Disposition', 'attachment; filename=bugReports.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        res.send(excelBuffer);
    });
});

app.listen(port, host, () => console.log(`Server running at http://${host}:${port}`));
