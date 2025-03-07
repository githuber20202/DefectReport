document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("bugReportForm");
    const nameInput = document.getElementById("reporterName");
    const systemSelect = document.getElementById("systemName");
    const reasonSelect = document.getElementById("reason");
    const moduleSelect = document.getElementById("module");
    const dynamicField = document.getElementById("dynamicField");
    const confirmationMessage = document.getElementById("confirmationMessage");
    const downloadExcelButton = document.getElementById("downloadExcel");
    const fileUploadField = document.getElementById("fileUpload");

    let API_BASE = "";

    async function loadConfig() {
        try {
            const response = await fetch("/config");
            const config = await response.json();
            const isLocal = window.location.hostname === "localhost";
            API_BASE = isLocal ? config.environments.local : config.environments.production;
            console.log("✅ API Base URL:", API_BASE);
        } catch (error) {
            console.error("❌ Error loading config:", error);
        }
    }

    await loadConfig(); // מחכה לטעינת API_BASE לפני המשך ביצוע הקוד
    setupEventListeners();

    function setupEventListeners() {
        if (!API_BASE) {
            console.error("🚨 API_BASE is not defined! Events will not be set up.");
            return;
        }

        if (fileUploadField) {
            console.log("הסתרת העלאת קובץ");
            fileUploadField.style.display = "none";
        }

        systemSelect.disabled = true;
        reasonSelect.disabled = true;
        moduleSelect.disabled = true;

        nameInput.addEventListener("input", function () {
            systemSelect.disabled = nameInput.value.trim() === "";
        });

        systemSelect.addEventListener("change", function () {
            reasonSelect.disabled = systemSelect.value === "";
        });

        reasonSelect.addEventListener("change", function () {
            moduleSelect.disabled = reasonSelect.value === "";
        });

        const systemModules = {
            "מערכת 1": ["מפה", "התראות", "מסננים"],
            "מערכת 2": ["מפה 2", "התראות 2", "מסננים 2"],
            "מערכת 3": ["מפה 3", "התראות 3", "מסננים 3"],
            "מערכת 4": ["מפה 4", "התראות 4", "מסננים 4"],
            "מערכת 5": ["מפה 5", "התראות 5", "מסננים 5"],
            "מערכת 6": ["מפה 6", "התראות 6", "מסננים 6"],
            "מערכת 7": ["מפה 7", "התראות 7", "מסננים 7"],
            "מערכת 8": ["מפה 8", "התראות 8", "מסננים 8"],
            "מערכת 9": ["מפה 9", "התראות 9", "מסננים 9"],
            "מערכת 10": ["מפה 10", "התראות 10", "מסננים 10"]
        };

        systemSelect.addEventListener("change", function () {
            const selectedSystem = systemSelect.value;
            moduleSelect.innerHTML = "<option value=''>בחר מודול...</option>";
            if (selectedSystem && systemModules[selectedSystem]) {
                systemModules[selectedSystem].forEach(module => {
                    const option = document.createElement("option");
                    option.value = module;
                    option.textContent = module;
                    moduleSelect.appendChild(option);
                });
            }
        });

        reasonSelect.addEventListener("change", function () {
            console.log("סיבת הפנייה שנבחרה:", reasonSelect.value);
            dynamicField.innerHTML = "";

            if (reasonSelect.value !== "") {
                const label = document.createElement("label");
                label.setAttribute("for", "description");
                const textarea = document.createElement("textarea");
                textarea.id = "description";
                textarea.name = "description";
                textarea.required = true;

                switch (reasonSelect.value) {
                    case "תקלה":
                        label.textContent = "תיאור שחזור התקלה:";
                        break;
                    case "בקשת הרשאות":
                        label.textContent = "הכנס בקשה מפורטת לקבלת הרשאה:";
                        break;
                    case "הצעת ייעול":
                        label.textContent = "הכנס את הצעת הייעול בצורה מפורטת:";
                        break;
                }
                dynamicField.appendChild(label);
                dynamicField.appendChild(textarea);
            }
        });

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!API_BASE) {
                console.error("🚨 API_BASE is not defined! Cannot submit the form.");
                return;
            }

            const formData = new FormData(form);
            try {
                const response = await fetch(`${API_BASE}/submitBugReport`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(Object.fromEntries(formData))
                });

                const data = await response.json();
                if (data.success) {
                    confirmationMessage.style.display = "block";
                    setTimeout(() => confirmationMessage.style.display = "none", 3000);
                    form.reset();
                    dynamicField.innerHTML = "";
                    systemSelect.disabled = true;
                    reasonSelect.disabled = true;
                    moduleSelect.disabled = true;
                }
            } catch (error) {
                console.error("❌ Error submitting report:", error);
            }
        });

        downloadExcelButton.addEventListener("click", function () {
            if (!API_BASE) {
                console.error("🚨 API_BASE is not defined! Cannot download Excel.");
                return;
            }
            window.location.href = `${API_BASE}/downloadExcel`;
        });
    }
});
