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

    // ✅ טעינת כתובת ה-API
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

        // ✅ פונקציה להוספת tooltip לשדות נעולים
        function addTooltip(element, message) {
            element.setAttribute("title", message);
            element.classList.add("tooltip");
        }

        function removeTooltip(element) {
            element.removeAttribute("title");
            element.classList.remove("tooltip");
        }

        addTooltip(systemSelect, "יש למלא שם מדווח תחילה.");
        addTooltip(reasonSelect, "יש לבחור מערכת תחילה.");
        addTooltip(moduleSelect, "יש לבחור סיבת פנייה תחילה.");

        nameInput.addEventListener("input", function () {
            if (this.value.trim() !== "") {
                systemSelect.disabled = false;
                removeTooltip(systemSelect);
            } else {
                systemSelect.disabled = true;
                addTooltip(systemSelect, "יש למלא שם מדווח תחילה.");
            }
        });

        systemSelect.addEventListener("change", function () {
            if (this.value !== "") {
                reasonSelect.disabled = false;
                removeTooltip(reasonSelect);
            } else {
                reasonSelect.disabled = true;
                addTooltip(reasonSelect, "יש לבחור מערכת תחילה.");
            }
        });

        reasonSelect.addEventListener("change", function () {
            if (this.value !== "") {
                moduleSelect.disabled = false;
                removeTooltip(moduleSelect);
            } else {
                moduleSelect.disabled = true;
                addTooltip(moduleSelect, "יש לבחור סיבת פנייה תחילה.");
            }
        });

        const systemModules = {
            "google-maps": ["כללי","מפה", "התראות", "מסננים"],
            "google-drive": ["כללי","מפה", "התראות", "מסננים"],
            "google-translate": ["כללי","מפה", "התראות", "מסננים"],
            "google-sheets": ["כללי","מפה", "התראות", "מסננים"],
            "google-calendar": ["כללי","מפה", "התראות", "מסננים"],
            "google-chat": ["כללי","מפה", "התראות", "מסננים"],
            "google-photos": ["כללי","מפה", "התראות", "מסננים"],
            "google-somthing": ["כללי","מפה", "התראות", "מסננים"],
            "google-piknik": ["כללי","מפה", "התראות", "מסננים"],
            "google-coffe": ["כללי","מפה", "התראות", "מסננים"]
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
                        label.textContent = "תיאור סוג ההרשאה:";
                        break;
                    case "הצעת ייעול":
                        label.textContent = "תיאור הצעת ייעול:";
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
