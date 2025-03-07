document.addEventListener("DOMContentLoaded", function() {
    loadApiConfig();
});

// ✅ טעינת כתובת ה-API מתוך `config.json`
let API_BASE = "";

function loadApiConfig() {
    fetch("config.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("❌ Failed to load config.json");
            }
            return response.json();
        })
        .then(config => {
            console.log("✅ Config Loaded:", config);

            // ✅ קביעת כתובת ה-API לפי הסביבה
            if (window.location.hostname.includes("github.io")) {
                API_BASE = config.environments.githubPages;
            } else if (window.location.hostname.includes("localhost")) {
                API_BASE = config.environments.local;
            } else {
                API_BASE = config.environments.production;
            }

            console.log("✅ API Base URL Selected:", API_BASE);

            // ✅ קריאה לפונקציה לאחר טעינת ה-API Base
            loadConfigData();
        })
        .catch(error => console.error("❌ Error loading API config:", error));
}

// ✅ טעינת הנתונים מהשרת
function loadConfigData() {
    if (!API_BASE) {
        console.error("❌ API Base URL is not loaded yet.");
        return;
    }

    fetch(`${API_BASE}/config`)
        .then(response => {
            if (!response.ok) {
                throw new Error("❌ Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ Server Config Loaded:", data);
            populateSelect("bugType", data.issueTypes);
            populateSelect("module", data.modules);
        })
        .catch(error => console.error('❌ Error loading config:', error));
}

// ✅ מילוי שדות בחירה בטופס
function populateSelect(selectId, options) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`❌ Element #${selectId} not found`);
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

// ✅ שליחת דיווח לשרת
document.getElementById("bugReportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    if (!API_BASE) {
        console.error("❌ API Base URL is not loaded yet.");
        return;
    }

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
            console.log("✅ Report saved successfully!");
        } else {
            console.error("❌ Error saving report:", data.error);
        }
    })
    .catch(error => console.error('❌ Error:', error));
});

// ✅ כפתור להורדת Excel מהשרת
document.getElementById("downloadExcel").addEventListener("click", function() {
    if (!API_BASE) {
        console.error("❌ API Base URL is not loaded yet.");
        return;
    }
    window.location.href = `${API_BASE}/downloadExcel`;
});
