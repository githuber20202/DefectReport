document.addEventListener("DOMContentLoaded", function() {
    loadConfigData();
});

// ✅ עדכון API_BASE לכתובת GitHub Pages
const API_BASE = "https://githuber20202.github.io/DefectReport";

// ✅ טעינת הנתונים מ-config.json
function loadConfigData() {
    fetch(`${API_BASE}/config.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            populateSelect("bugType", data.issueTypes);
            populateSelect("module", data.modules);
        })
        .catch(error => console.error('Error loading config:', error));
}

// ✅ מילוי הרשימות הנפתחות
function populateSelect(selectId, options) {
    const selectElement = document.getElementById(selectId);
    selectElement.innerHTML = ""; // ניקוי התוכן הקודם
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// ✅ שליחת הדיווח לשרת (GitHub Pages לא תומך בכתיבה, דורש Backend חיצוני)
document.getElementById("bugReportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    alert("🚨 שליחת דיווחים לא נתמכת ב-GitHub Pages! יש צורך בשרת Backend אמיתי.");
});

// ✅ כפתור להורדת Excel (GitHub Pages לא תומך)
document.getElementById("downloadExcel").addEventListener("click", function() {
    alert("🚨 הורדת Excel לא נתמכת ב-GitHub Pages! יש צורך בשרת Backend אמיתי.");
});
