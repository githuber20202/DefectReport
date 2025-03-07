document.addEventListener("DOMContentLoaded", function() {
    loadConfigData();
});

// ✅ משתנה שיכיל את כתובת ה-API שנבחרה
let API_BASE = "";

// ✅ טעינת הנתונים מ-`config.json`
fetch("config.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("❌ Failed to load API configuration.");
        }
        return response.json();
    })
    .then(config => {
        console.log("✅ Config Loaded:", config);

        // ✅ זיהוי סביבה אוטומטי
        if (window.location.hostname.includes("github.io")) {
            API_BASE = config.environments.githubPages;
        } else if (window.location.hostname.includes("localhost")) {
            API_BASE = config.environments.local;
        } else {
            API_BASE = config.environments.production;
        }

        console.log("✅ API Base URL Selected:", API_BASE);
        loadServerConfig();
    })
    .catch(error => console.error("❌ Error loading API config:", error));

// ✅ טעינת הנתונים מהשרת
function loadServerConfig() {
    if (!API_BASE) {
        console.error("❌ API Base URL is not set.");
        return;
    }

    fetch(`${API_BASE}/config`)
        .then(response => {
            if (!response.ok) {
                throw new Error("❌ Failed to load server config.");
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ Server Config Loaded:", data);
            populateSelect("bugType", data.issueTypes);
            populateSelect("module", data.modules);
        })
        .catch(error => console.error('❌ Error loading server config:', error));
}

// ✅ מילוי השדות בטופס
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

    if (!API_BASE) {
        console.error("❌ API Base URL is not set.");
        return;
    }

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
            console.log("✅ Report saved successfully!");
        } else {
            console.error("❌ Error saving report:", data.error);
        }
    })
    .catch(error => console.error('❌ Error submitting report:', error));
});

// ✅ כפתור להורדת Excel
document.getElementById("downloadExcel").addEventListener("click", function() {
    if (!API_BASE) {
        console.error("❌ API Base URL is not set.");
        return;
    }
    window.location.href = `${API_BASE}/downloadExcel`;
});
