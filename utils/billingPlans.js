// Billing plan definitions
const BILLING_PLANS = [
  { key: "monthly",     label: "Monthly",       months: 1  },
  { key: "weekly",      label: "Weekly",        months: null }, // special case
  { key: "quarterly",   label: "3 Months",      months: 3  },
  { key: "halfyearly",  label: "6 Months",      months: 6  },
  { key: "yearly",      label: "Yearly",        months: 12 },
  { key: "enquiry",     label: "Enquiry Only",  months: null },
];

// Which plans are available for each category
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

// Given a list of selected categories, return the union of all allowed plans
function getPlansForCategories(categories = []) {
  const seen = new Set();
  const plans = [];
  for (const catKey of categories) {
    const allowed = CATEGORY_BILLING_MAP[catKey] || ["enquiry"];
    for (const planKey of allowed) {
      if (!seen.has(planKey)) {
        seen.add(planKey);
        const plan = BILLING_PLANS.find(p => p.key === planKey);
        if (plan) plans.push(plan);
      }
    }
  }
  // Always ensure at least enquiry
  if (plans.length === 0) {
    plans.push(BILLING_PLANS.find(p => p.key === "enquiry"));
  }
  return plans;
}

module.exports = { BILLING_PLANS, CATEGORY_BILLING_MAP, getPlansForCategories };