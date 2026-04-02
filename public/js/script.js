(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Auto-dismiss alerts after 5 seconds
setTimeout(() => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    const bsAlert = new bootstrap.Alert(alert);
    bsAlert.close();
  });
}, 4000);

// ✅ THE FIX: Stop flash messages from reappearing on "Back" button
window.addEventListener('pageshow', (event) => {
  // event.persisted is TRUE if the browser loaded the page from its Back/Forward memory cache
  if (event.persisted) {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      alert.remove(); // Instantly wipe it out of the DOM
    });
  }
});