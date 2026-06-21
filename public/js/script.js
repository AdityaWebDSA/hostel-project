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

// Category group validation: at least one checkbox must be checked
document.querySelectorAll('.category-group').forEach(group => {
  const checkboxes = group.querySelectorAll('.category-checkbox');
  const validityInput = group.querySelector('.category-validity');

  function updateValidity() {
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    validityInput.value = anyChecked ? "ok" : "";
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateValidity));
  updateValidity();
});
// Billing group validation
document.querySelectorAll('.billing-group').forEach(group => {
  const checkboxes = group.querySelectorAll('.billing-checkbox');
  const validityInput = group.querySelector('.billing-validity');

  function updateValidity() {
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    validityInput.value = anyChecked ? "ok" : "";
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateValidity));
  updateValidity();
});

// Auto-suggest billing plans when categories change
const CATEGORY_BILLING_MAP = {
  "hostels-pgs":        ["monthly", "quarterly", "halfyearly", "yearly"],
  "independent-rooms":  ["monthly", "quarterly", "halfyearly", "yearly"],
  "near-campus":        ["monthly", "quarterly", "halfyearly", "yearly"],
  "gym-fitness":        ["monthly", "quarterly", "halfyearly", "yearly"],
  "mess-tiffins":       ["weekly", "monthly"],
  "libraries-study":    ["monthly", "quarterly"],
  "laundry-clean":      ["enquiry"],
  "xerox-stationery":   ["enquiry"],
  "cafes-chai":         ["enquiry"],
  "bus-stops":          ["enquiry"],
  "clinics-medical":    ["enquiry"],
};

const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const billingCheckboxes = document.querySelectorAll('.billing-checkbox');

function suggestBillingPlans() {
  if (categoryCheckboxes.length === 0 || billingCheckboxes.length === 0) return;

  // Collect selected categories
  const selected = Array.from(categoryCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  // Build union of suggested billing plans
  const suggested = new Set();
  selected.forEach(cat => {
    const plans = CATEGORY_BILLING_MAP[cat] || ["enquiry"];
    plans.forEach(p => suggested.add(p));
  });

  if (suggested.size === 0) return;

  // Check suggested plans, uncheck ones no longer relevant
  billingCheckboxes.forEach(cb => {
    if (suggested.has(cb.value)) {
      cb.checked = true;
    } else {
      cb.checked = false;
    }
    // Trigger validity update
    cb.dispatchEvent(new Event('change'));
  });
}

// Only auto-suggest on new listing form (not edit, where owner chose deliberately)
if (document.querySelector('.category-checkbox') && document.getElementById('billingGrid')) {
  // Only run auto-suggest if this looks like the new form (no existing data)
  const isNewForm = !document.querySelector('.billing-checkbox:checked');
  if (isNewForm) {
    categoryCheckboxes.forEach(cb => cb.addEventListener('change', suggestBillingPlans));
  }
}