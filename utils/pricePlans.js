const PRICE_PLANS = [
    { key: "monthly",    label: "/ month",     shortLabel: "mo"  },
    { key: "quarterly",  label: "/ 3 months",  shortLabel: "3mo" },
    { key: "halfyearly", label: "/ 6 months",  shortLabel: "6mo" },
    { key: "yearly",     label: "/ year",      shortLabel: "yr"  },
    { key: "onetime",    label: "one-time",    shortLabel: "once"},
    { key: "free",       label: "Free",        shortLabel: "free"},
];

// Categories that are service-based (no pricing plan needed — just show price as flat rate or free)
const SERVICE_CATEGORIES = ["xerox-stationery", "laundry-clean", "cafes-chai", "bus-stops", "clinics-medical"];

function isServiceCategory(categories = []) {
    return categories.length > 0 && categories.every(c => SERVICE_CATEGORIES.includes(c));
}

module.exports = { PRICE_PLANS, SERVICE_CATEGORIES, isServiceCategory };