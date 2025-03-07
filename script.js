document.addEventListener("DOMContentLoaded", function() {
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

    // 🚀 טוען את כתובת ה-API מה-config.json
    fetch("/config")
        .then(response => response.json())
        .then(config => {
            API_BASE = config.environments.production || "http://localhost:3000";
            console.log("✅ API Base URL:", API_BASE);
        })
        .catch(error => console.error("❌ Error loading config:", error));

    // 🔒 הסתרת שדה העלאת קובץ בצורה מוחלטת
    if (fileUploadField) {
        console.log("הסתרת העלאת קובץ");
        fileUploadField.style.display = "none";
    }

    // 🔒 הגבלת בחירת שדות לפי סדר
    systemSelect.disabled = true;
    reasonSelect.disabled = true;
    moduleSelect.disabled = true;

    nameInput.addEventListener("input", function() {
        systemSelect.disabled = nameInput.value.trim() === "";
    });

    systemSelect.addEventListener("change", function() {
        reasonSelect.disabled = systemSelect.value === "";
    });

    reasonSelect.addEventListener("change", function() {
        moduleSelect.disabled = reasonSelect.value === "";
    });

    // ✅ עדכון מודולים בהתאם לבחירת מערכת
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

    systemSelect.addEventListener("change", function() {
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

    // ✅ עדכון שדות דינמיים בהתאם לסיבת הפנייה
    reasonSelect.addEventListener("change", function() {
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

    // ✅ שליחת הדיווח
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        fetch(`${API_BASE}/submitBugReport`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(formData))
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                confirmationMessage.style.display = "block";
                setTimeout(() => confirmationMessage.style.display = "none", 3000);
                form.reset();
                dynamicField.innerHTML = ""; // ✅ מחיקת שדה ההזנה הדינמי לאחר השליחה
                systemSelect.disabled = true;
                reasonSelect.disabled = true;
                moduleSelect.disabled = true;
            }
        })
        .catch(error => console.error("❌ Error submitting report:", error));
    });

    // ✅ הורדת Excel
    downloadExcelButton.addEventListener("click", function() {
        window.location.href = `${API_BASE}/downloadExcel`;
    });
});
