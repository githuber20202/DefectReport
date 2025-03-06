document.addEventListener("DOMContentLoaded", function() {
  loadConfigData();
});

function loadConfigData() {
  fetch("/config")
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

// שליחת הטופס
document.getElementById("bugReportForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const formData = new FormData(this);

  fetch("/submitBugReport", {
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
      }
  })
  .catch(error => console.error('Error:', error));
});
