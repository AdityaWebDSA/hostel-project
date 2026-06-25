// Amenities available per category.
// Used by: new/edit forms (dynamic checkboxes), show page (display icons+labels)
const AMENITY_MAP = {
  "hostels-pgs": [
    { key: "wifi",         label: "Wi-Fi",              icon: "fa-solid fa-wifi" },
    { key: "meals",        label: "Meals Included",     icon: "fa-solid fa-utensils" },
    { key: "ac",           label: "AC Rooms",           icon: "fa-solid fa-snowflake" },
    { key: "warden",       label: "Warden/Security",    icon: "fa-solid fa-shield-halved" },
    { key: "cctv",         label: "CCTV",               icon: "fa-solid fa-video" },
    { key: "laundry",      label: "Laundry",            icon: "fa-solid fa-shirt" },
    { key: "parking",      label: "Parking",            icon: "fa-solid fa-square-parking" },
    { key: "power_backup", label: "Power Backup",       icon: "fa-solid fa-bolt" },
    { key: "ro_water",     label: "RO Water",           icon: "fa-solid fa-faucet" },
    { key: "study_room",   label: "Study Room",         icon: "fa-solid fa-book" },
    { key: "tv_room",      label: "TV/Common Room",     icon: "fa-solid fa-tv" },
    { key: "attached_bath",label: "Attached Bathroom",  icon: "fa-solid fa-bath" },
  ],
  "independent-rooms": [
    { key: "wifi",         label: "Wi-Fi",              icon: "fa-solid fa-wifi" },
    { key: "ac",           label: "AC",                 icon: "fa-solid fa-snowflake" },
    { key: "furnished",    label: "Furnished",          icon: "fa-solid fa-couch" },
    { key: "kitchen",      label: "Kitchen Access",     icon: "fa-solid fa-kitchen-set" },
    { key: "parking",      label: "Parking",            icon: "fa-solid fa-square-parking" },
    { key: "power_backup", label: "Power Backup",       icon: "fa-solid fa-bolt" },
    { key: "attached_bath",label: "Attached Bathroom",  icon: "fa-solid fa-bath" },
    { key: "cctv",         label: "CCTV",               icon: "fa-solid fa-video" },
  ],
  "near-campus": [
    { key: "wifi",         label: "Wi-Fi",              icon: "fa-solid fa-wifi" },
    { key: "furnished",    label: "Furnished",          icon: "fa-solid fa-couch" },
    { key: "ac",           label: "AC",                 icon: "fa-solid fa-snowflake" },
    { key: "parking",      label: "Parking",            icon: "fa-solid fa-square-parking" },
    { key: "power_backup", label: "Power Backup",       icon: "fa-solid fa-bolt" },
  ],
  "gym-fitness": [
    { key: "trainer",      label: "Personal Trainer",   icon: "fa-solid fa-person-running" },
    { key: "cardio",       label: "Cardio Equipment",   icon: "fa-solid fa-heart-pulse" },
    { key: "weights",      label: "Free Weights",       icon: "fa-solid fa-dumbbell" },
    { key: "locker",       label: "Locker Room",        icon: "fa-solid fa-lock" },
    { key: "ac",           label: "AC",                 icon: "fa-solid fa-snowflake" },
    { key: "steam",        label: "Steam/Sauna",        icon: "fa-solid fa-hot-tub-person" },
    { key: "diet",         label: "Diet Consultation",  icon: "fa-solid fa-apple-whole" },
    { key: "parking",      label: "Parking",            icon: "fa-solid fa-square-parking" },
  ],
  "mess-tiffins": [
    { key: "veg",          label: "Veg Menu",           icon: "fa-solid fa-leaf" },
    { key: "nonveg",       label: "Non-Veg Menu",       icon: "fa-solid fa-drumstick-bite" },
    { key: "jain",         label: "Jain Options",       icon: "fa-solid fa-seedling" },
    { key: "home_style",   label: "Home-Style Cooking", icon: "fa-solid fa-house" },
    { key: "tiffin_del",   label: "Tiffin Delivery",    icon: "fa-solid fa-motorcycle" },
    { key: "trial_meal",   label: "Free Trial Meal",    icon: "fa-solid fa-star" },
    { key: "monthly_plan", label: "Monthly Plan",       icon: "fa-solid fa-calendar" },
  ],
  "libraries-study": [
    { key: "ac",           label: "AC",                 icon: "fa-solid fa-snowflake" },
    { key: "wifi",         label: "Wi-Fi",              icon: "fa-solid fa-wifi" },
    { key: "locker",       label: "Lockers",            icon: "fa-solid fa-lock" },
    { key: "printing",     label: "Printing",           icon: "fa-solid fa-print" },
    { key: "power_plug",   label: "Power Plugs",        icon: "fa-solid fa-plug" },
    { key: "24hrs",        label: "24-Hour Access",     icon: "fa-solid fa-clock" },
    { key: "silent_zone",  label: "Silent Zone",        icon: "fa-solid fa-volume-xmark" },
  ],
  "xerox-stationery": [
    { key: "color_print",  label: "Color Printing",     icon: "fa-solid fa-palette" },
    { key: "bw_print",     label: "B&W Printing",       icon: "fa-solid fa-print" },
    { key: "binding",      label: "Binding",            icon: "fa-solid fa-book-open" },
    { key: "lamination",   label: "Lamination",         icon: "fa-solid fa-layer-group" },
    { key: "scan",         label: "Scanning",           icon: "fa-solid fa-scanner-image" },
    { key: "stationery",   label: "Stationery Items",   icon: "fa-solid fa-pen" },
    { key: "id_card",      label: "ID Card Printing",   icon: "fa-solid fa-id-card" },
  ],
  "laundry-clean": [
    { key: "wash_fold",    label: "Wash & Fold",        icon: "fa-solid fa-shirt" },
    { key: "dry_clean",    label: "Dry Cleaning",       icon: "fa-solid fa-wind" },
    { key: "ironing",      label: "Ironing",            icon: "fa-solid fa-temperature-high" },
    { key: "pickup_drop",  label: "Pickup & Drop",      icon: "fa-solid fa-motorcycle" },
    { key: "express",      label: "Express Service",    icon: "fa-solid fa-bolt" },
  ],
  "clinics-medical": [
    { key: "opd",          label: "OPD Available",      icon: "fa-solid fa-user-doctor" },
    { key: "pharmacy",     label: "Pharmacy",           icon: "fa-solid fa-pills" },
    { key: "emergency",    label: "Emergency Care",     icon: "fa-solid fa-truck-medical" },
    { key: "lab",          label: "Lab Tests",          icon: "fa-solid fa-flask" },
    { key: "upi_pay",      label: "UPI Payment",        icon: "fa-solid fa-mobile-screen" },
    { key: "lady_doc",     label: "Lady Doctor",        icon: "fa-solid fa-user-doctor" },
  ],
  "bus-stops": [
    { key: "shelter",      label: "Bus Shelter",        icon: "fa-solid fa-umbrella" },
    { key: "route_info",   label: "Route Info Board",   icon: "fa-solid fa-signs-post" },
    { key: "night_bus",    label: "Night Bus",          icon: "fa-solid fa-moon" },
    { key: "city_bus",     label: "City Bus",           icon: "fa-solid fa-bus" },
    { key: "state_bus",    label: "State Bus (MSRTC)",  icon: "fa-solid fa-bus-simple" },
  ],
  "cafes-chai": [
    { key: "dine_in",      label: "Dine-In",            icon: "fa-solid fa-chair" },
    { key: "takeaway",     label: "Takeaway",           icon: "fa-solid fa-bag-shopping" },
    { key: "delivery",     label: "Delivery",           icon: "fa-solid fa-motorcycle" },
    { key: "wifi",         label: "Wi-Fi",              icon: "fa-solid fa-wifi" },
    { key: "upi_pay",      label: "UPI Payment",        icon: "fa-solid fa-mobile-screen" },
    { key: "veg_only",     label: "Veg Only",           icon: "fa-solid fa-leaf" },
    { key: "cold_drinks",  label: "Cold Drinks",        icon: "fa-solid fa-glass-water" },
  ],
};

// Returns union of amenities for a given array of category keys
function getAmenitiesForCategories(categories = []) {
    const seen = new Set();
    const result = [];
    for (const cat of categories) {
        const list = AMENITY_MAP[cat] || [];
        for (const amenity of list) {
            if (!seen.has(amenity.key)) {
                seen.add(amenity.key);
                result.push(amenity);
            }
        }
    }
    return result;
}

// Flat map of all amenities (for lookup by key on show page)
const ALL_AMENITIES = Object.values(AMENITY_MAP).flat().reduce((acc, a) => {
    if (!acc[a.key]) acc[a.key] = a;
    return acc;
}, {});

module.exports = { AMENITY_MAP, getAmenitiesForCategories, ALL_AMENITIES };