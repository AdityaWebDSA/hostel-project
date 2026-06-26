const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Recomputes avgRating and reviewCount for a listing and saves it.
// Call this after any review is created or deleted.
module.exports = async function updateRating(listingId) {
    const listing = await Listing.findById(listingId).populate("reviews");
    if (!listing) return;

    const count = listing.reviews.length;
    if (count === 0) {
        listing.avgRating = 0;
        listing.reviewCount = 0;
    } else {
        const total = listing.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        listing.avgRating = parseFloat((total / count).toFixed(1));
        listing.reviewCount = count;
    }

    await listing.save();
};