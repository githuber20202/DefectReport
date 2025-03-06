document.addEventListener("DOMContentLoaded", function() {
  loadConfigData();
});

// טעינת הנתונים מ-config.json
function loadConfigData() {
  fetch("http://localhost:3000/config")
      .then(response => response.json())
      .then(data => {
          populateSelect("bugType", data.issueTypes);
          populateSelect("module", data.modules);
      })
      .catch(error => console.error('Error loading config:', error));
}

function populateSelect(selectId, options) {
  const selectElement = document.getElementById(selectId);
  selectElement.innerHTML = ""; // ניקוי התוכן הקודם
  options.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
  });
}

// שליחת הדיווח לשרת
document.getElementById("bugReportForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const formData = new FormData(this);

  fetch("http://localhost:3000/submitBugReport", {
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
      } else {
          console.error("Error saving report:", data.error);
      }
  })
  .catch(error => console.error('Error:', error));
});

// ✅ כפתור להורדת Excel
document.getElementById("downloadExcel").addEventListener("click", function() {
  window.location.href = "http://localhost:3000/downloadExcel";
});
