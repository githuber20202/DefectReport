let API_BASE = "";

document.addEventListener("DOMContentLoaded", function() { 
    loadApiConfig();
});

// טעינת כתובת ה-API מקובץ config.json
function loadApiConfig() {
    fetch("config.json")
        .then(response => response.json())
        .then(config => { 
            API_BASE = config.apiBaseUrl;
            console.log("API Base URL Selected:", API_BASE);
            loadConfigData();
        })
        .catch(error => console.error("Error loading API config:", error));
}

// טעינת הנתונים מהשרת
function loadConfigData() {
    if (!API_BASE) {
        console.error("API Base URL is not loaded yet.");
        return;
    }

    fetch(`${API_BASE}/config`)
        .then(response => response.json())
        .then(data => {
            console.log("Config Loaded:", data);
            populateSelect("bugType", data.issueTypes);
            populateSelect("module", data.modules);
        })
        .catch(error => console.error("Error loading config:", error));
}

// מילוי השדות בטופס
function populateSelect(selectId, options) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`Element #${selectId} not found`);
        return;
    }
    selectElement.innerHTML = "";
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// מניעת שליחה כפולה
document.getElementById("bugReportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const submitButton = document.querySelector("#bugReportForm button");
    if (submitButton.disabled) return;  
    submitButton.disabled = true; 

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
    .catch(error => console.error("Error:", error))
    .finally(() => {
        setTimeout(() => submitButton.disabled = false, 3000);
    });
});

// כפתור להורדת Excel
document.getElementById("downloadExcel").addEventListener("click", function() {
    window.location.href = `${API_BASE}/downloadExcel`;
});
