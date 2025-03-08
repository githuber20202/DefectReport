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

        // ✅ פונקציה לעדכון סרגל ההתקדמות
        function updateProgressBar(step) {
            // נקה את כל הסטטוסים הקודמים
            document.querySelectorAll('.progress-step').forEach(el => {
                el.classList.remove('active', 'completed');
            });
            
            // סמן את כל השלבים שהושלמו
            for (let i = 1; i < step; i++) {
                const stepElement = document.getElementById(`step${i}`);
                if (stepElement) {
                    stepElement.classList.add('completed');
                }
            }
            
            // סמן את השלב הנוכחי כפעיל
            const currentStep = document.getElementById(`step${step}`);
            if (currentStep) {
                currentStep.classList.add('active');
            }
        }

        // ✅ עטוף כל שדה קלט ב-div עם מחוון תקינות
        function wrapInputsWithContainer() {
            const inputs = [nameInput, systemSelect, reasonSelect, moduleSelect];
            
            inputs.forEach(input => {
                if (!input.parentElement.classList.contains('field-container')) {
                    const container = document.createElement('div');
                    container.className = 'field-container';
                    
                    const indicator = document.createElement('span');
                    indicator.className = 'valid-indicator';
                    indicator.innerHTML = '✓';
                    
                    input.parentNode.insertBefore(container, input);
                    container.appendChild(input);
                    container.appendChild(indicator);
                }
            });
            
            // גם לשדה דינמי כשנוצר
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        const textarea = dynamicField.querySelector('textarea');
                        if (textarea && !textarea.parentElement.classList.contains('field-container')) {
                            const container = document.createElement('div');
                            container.className = 'field-container';
                            
                            const indicator = document.createElement('span');
                            indicator.className = 'valid-indicator';
                            indicator.innerHTML = '✓';
                            
                            textarea.parentNode.insertBefore(container, textarea);
                            container.appendChild(textarea);
                            container.appendChild(indicator);
                        }
                    }
                });
            });
            
            observer.observe(dynamicField, { childList: true, subtree: true });
        }

        // הוסף tooltips ראשוניים
        addTooltip(systemSelect, "יש למלא שם מדווח תחילה.");
        addTooltip(reasonSelect, "יש לבחור מערכת תחילה.");
        addTooltip(moduleSelect, "יש לבחור סיבת פנייה תחילה.");

        // אתחול סרגל ההתקדמות והמחוונים
        wrapInputsWithContainer();
        updateProgressBar(1);

        // ✅ מאזיני אירועים עם תמיכה בסרגל התקדמות

        nameInput.addEventListener("input", function () {
            if (this.value.trim() !== "") {
                systemSelect.disabled = false;
                systemSelect.classList.add('animated-field');
                removeTooltip(systemSelect);
                this.parentElement.classList.add('valid');
                updateProgressBar(2);
            } else {
                systemSelect.disabled = true;
                this.parentElement.classList.remove('valid');
                addTooltip(systemSelect, "יש למלא שם מדווח תחילה.");
                updateProgressBar(1);
            }
        });

        systemSelect.addEventListener("change", function () {
            const selectedSystem = systemSelect.value;
            
            if (selectedSystem !== "") {
                reasonSelect.disabled = false;
                reasonSelect.classList.add('animated-field');
                removeTooltip(reasonSelect);
                this.parentElement.classList.add('valid');
                updateProgressBar(3);
                
                // עדכון רשימת המודולים
                moduleSelect.innerHTML = "<option value=''>בחר מודול...</option>";
                if (selectedSystem && systemModules[selectedSystem]) {
                    systemModules[selectedSystem].forEach(module => {
                        const option = document.createElement("option");
                        option.value = module;
                        option.textContent = module;
                        moduleSelect.appendChild(option);
                    });
                }
            } else {
                reasonSelect.disabled = true;
                this.parentElement.classList.remove('valid');
                addTooltip(reasonSelect, "יש לבחור מערכת תחילה.");
                updateProgressBar(2);
            }
        });

        reasonSelect.addEventListener("change", function () {
            console.log("סיבת הפנייה שנבחרה:", reasonSelect.value);
            dynamicField.innerHTML = "";

            if (this.value !== "") {
                moduleSelect.disabled = false;
                moduleSelect.classList.add('animated-field');
                removeTooltip(moduleSelect);
                this.parentElement.classList.add('valid');
                updateProgressBar(4);
                
                // יצירת שדה תיאור דינמי
                const label = document.createElement("label");
                label.setAttribute("for", "description");
                const textarea = document.createElement("textarea");
                textarea.id = "description";
                textarea.name = "description";
                textarea.required = true;
                textarea.classList.add('animated-field');

                switch (this.value) {
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
            } else {
                moduleSelect.disabled = true;
                this.parentElement.classList.remove('valid');
                addTooltip(moduleSelect, "יש לבחור סיבת פנייה תחילה.");
                updateProgressBar(3);
            }
        });

        // ✅ הוסף האזנה לשינויים בשדה המודול
        moduleSelect.addEventListener("change", function() {
            if (this.value !== "") {
                this.parentElement.classList.add('valid');
                updateProgressBar(5);
            } else {
                this.parentElement.classList.remove('valid');
                updateProgressBar(4);
            }
        });

        // ✅ הוספת האזנה לשדה התיאור הדינמי
        dynamicField.addEventListener("input", function(e) {
            if (e.target && e.target.tagName === "TEXTAREA") {
                if (e.target.value.trim() !== "") {
                    e.target.parentElement.classList.add('valid');
                } else {
                    e.target.parentElement.classList.remove('valid');
                }
            }
        });

        const systemModules = {
            "google-maps": ["כללי", "מפה", "התראות", "מסננים"],
            "google-drive": ["כללי", "מפה", "התראות", "מסננים"],
            "google-translate": ["כללי", "מפה", "התראות", "מסננים"],
            "google-sheets": ["כללי", "מפה", "התראות", "מסננים"],
            "google-calendar": ["כללי", "מפה", "התראות", "מסננים"],
            "google-chat": ["כללי", "מפה", "התראות", "מסננים"],
            "google-photos": ["כללי", "מפה", "התראות", "מסננים"],
            "google-somthing": ["כללי", "מפה", "התראות", "מסננים"],
            "google-piknik": ["כללי", "מפה", "התראות", "מסננים"],
            "google-coffe": ["כללי", "מפה", "התראות", "מסננים"]
        };

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
                    
                    // איפוס סרגל התקדמות ומחווני תקינות
                    document.querySelectorAll('.field-container').forEach(container => {
                        container.classList.remove('valid');
                    });
                    updateProgressBar(1);
                    
                    // הוספת tooltips שוב
                    addTooltip(systemSelect, "יש למלא שם מדווח תחילה.");
                    addTooltip(reasonSelect, "יש לבחור מערכת תחילה.");
                    addTooltip(moduleSelect, "יש לבחור סיבת פנייה תחילה.");
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