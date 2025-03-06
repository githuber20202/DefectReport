document.addEventListener("DOMContentLoaded", function() {
    loadConfigData();
});

// ✅ שימוש ב-GitHub Pages בלי שרת
const API_BASE = "https://defectreport.onrender.com";

// ✅ טעינת הנתונים ישירות מהקובץ `config.json`
function loadConfigData() {
    fetch(`${API_BASE}/config.json`)
        .then(response => response.json())
        .then(data => {
            console.log("Config Loaded:", data); // 🔍 בדיקה
            populateSelect("bugType", data.issueTypes);
            populateSelect("module", data.modules);
        })
        .catch(error => console.error('Error loading config:', error));
}

// ✅ מילוי השדות בטופס
function populateSelect(selectId, options) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`Element #${selectId} not found`);
        return;
    }
    selectElement.innerHTML = ""; // ניקוי הקיים
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// ❌ מניעת שליחת דיווחים (כי אין שרת ב-GitHub Pages)
document.getElementById("bugReportForm").addEventListener("submit", function(event) {
    event.preventDefault();
    alert("🚨 שליחת דיווחים לא נתמכת ב-GitHub Pages! יש צורך בשרת Backend אמיתי.");
});

// ❌ מניעת הורדת Excel (כי אין שרת מאחסן נתונים)
document.getElementById("downloadExcel").addEventListener("click", function() {
    alert("🚨 הורדת Excel לא נתמכת ב-GitHub Pages! יש צורך בשרת Backend אמיתי.");
});
