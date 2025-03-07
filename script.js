let API_BASE = ""; // מוגדר ריק בהתחלה

document.addEventListener("DOMContentLoaded", function () {
    loadApiConfig().then(() => {
        loadConfigData();
    }).catch(error => console.error("❌ Failed to load API config:", error));
});

// ✅ טוען את כתובת ה-API מתוך config.json
function loadApiConfig() {
    return fetch("config.json")
        .then(response => response.json())
        .then(config => {
            API_BASE = config.apiBaseUrl;
            console.log("✅ API Base URL Selected:", API_BASE);
        })
        .catch(error => {
            console.error("❌ Error loading API config:", error);
            throw error;
        });
}

// ✅ טעינת הנתונים לאחר ש-API_BASE נטען
function loadConfigData() {
    if (!API_BASE) {
        console.error("❌ API Base URL is not loaded yet.");
        return;
    }

    fetch(`${API_BASE}/config`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Config Loaded:", data);
            populateSelect("bugType", data.issueTypes);
            populateSelect("module", data.modules);
        })
        .catch(error => console.error("❌ Error loading config:", error));
}

// ✅ מילוי הרשימות הנפתחות
function populateSelect(selectId, options) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`❌ Element #${selectId} not found`);
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
