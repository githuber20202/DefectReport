document.getElementById("bugReportForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const formData = new FormData(this);

  fetch("/submitBugReport", {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById("confirmationMessage").style.display = "block";
    }
  })
  .catch(error => console.error('Error:', error));
});
