const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); 
const XLSX = require('xlsx');

const app = express();
const port = 3000;

// ✅ Enable CORS
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ Home Page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// ✅ API: Get Configuration
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

// ✅ API: Submit Bug Report
app.post('/submitBugReport', (req, res) => {
    const { bugType, module, description } = req.body;
    if (!bugType || !module || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const bugReport = { bugType, module, description, timestamp: new Date().toISOString() };

    fs.readFile('bugReports.json', (err, data) => {
        let reports = !err && data.length ? JSON.parse(data) : [];

        // ✅ Check if the bug already exists
        const exists = reports.some(report =>
            report.bugType === bugReport.bugType &&
            report.module === bugReport.module &&
            report.description === bugReport.description
        );

        if (exists) {
            return res.status(409).json({ error: "Duplicate report detected" }); 
        }

        reports.push(bugReport);
        fs.writeFile('bugReports.json', JSON.stringify(reports, null, 2), () => {
            res.json({ success: true });
        });
    });
});

// ✅ API: Download Excel
app.get('/downloadExcel', (req, res) => {
    fs.readFile('bugReports.json', (err, data) => {
        const reports = !err && data.length ? JSON.parse(data) : [];
        const ws = XLSX.utils.json_to_sheet(reports);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bug Reports");
        res.setHeader('Content-Disposition', 'attachment; filename=bugReports.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(XLSX.write(wb, { bookType: "xlsx", type: "buffer" }));
    });
});

// ✅ Start the Server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
