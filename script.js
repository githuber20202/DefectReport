document.addEventListener("DOMContentLoaded", function() {
    loadConfigData();
});

// ✅ כתובת ה-API החדשה שמחוברת ל-Render
const API_BASE = "https://defectreport.onrender.com"; 

// ✅ טעינת הנתונים מהשרת
function loadConfigData() {
    fetch(`${API_BASE}/config`) // 🔄 שינוי הנתיב לקריאה נכונה
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Config Loaded:", data); // 🔍 בדיקה שהנתונים נטענים
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

// ✅ שליחת דיווח לשרת ב-Render
document.getElementById("bugReportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch(`${API_BASE}/submitBugReport`, {
        method: "POST",
        body: JSON.stringify({
            bugType: formData.get("bugType"),
            module: formData.get("module"),
            description: formData.get("description")
        }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("confirmationMessage").style.display = "block";
            console.log("Report saved successfully!");
        } else {
            console.error("Error saving report:", data.error);
        }
    })
    .catch(error => console.error('Error:', error));
});

// ✅ כפתור להורדת Excel מהשרת
document.getElementById("downloadExcel").addEventListener("click", function() {
    window.location.href = `${API_BASE}/downloadExcel`;
});
