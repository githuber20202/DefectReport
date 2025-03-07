let API_BASE = "";

document.addEventListener("DOMContentLoaded", function() {
    loadApiConfig();
});

// ✅ Load API Configuration from config.json
function loadApiConfig() {
    fetch("config.json")
        .then(response => response.json())
        .then(config => {
            const env = window.location.hostname.includes("github.io") ? "githubPages"
                      : window.location.hostname.includes("localhost") ? "local"
                      : "production";
            
            API_BASE = config.environments[env];
            console.log("🔹 API Base URL Selected:", API_BASE);
            
            if (!API_BASE) {
                throw new Error("API Base URL is not defined.");
            }
            
            loadConfigData();
        })
        .catch(error => console.error("❌ Error loading API config:", error));
}

// ✅ Load dynamic config data (issue types, modules, etc.)
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

// ✅ Populate dropdowns
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

// ✅ Prevent duplicate submissions
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
            console.log("✅ Report saved successfully!");
        } else {
            console.error("❌ Error saving report:", data.error);
        }
    })
    .catch(error => console.error("❌ Error:", error))
    .finally(() => {
        setTimeout(() => submitButton.disabled = false, 3000);
    });
});

// ✅ Handle Excel download
document.getElementById("downloadExcel").addEventListener("click", function() {
    window.location.href = `${API_BASE}/downloadExcel`;
});
