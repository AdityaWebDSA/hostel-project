const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing, normalizeCategory } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

// Multer Setup - Configured once with an 8 MB file size limit
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ 
    storage, 
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file, matches client-side limit
});

// Index & Create Route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.array('listing[image]', 5), // Uses configured limit (Max 5 files)
        normalizeCategory,
        validateListing,
        wrapAsync(listingController.createListing)
    );

// Static routes placed above /:id to prevent routing collisions
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/search", wrapAsync(listingController.searchListings));
router.get("/geocode-preview", wrapAsync(listingController.geocodePreview));
router.get("/nearby", wrapAsync(listingController.nearbyListings));
router.get("/mylisting", isLoggedIn, wrapAsync(listingController.myListings));

// Temporary script route (safe from parameter collisions)
router.get("/recalculate-ratings", wrapAsync(async (req, res) => {
    const Listing = require("../models/listing");
    const updateRating = require("../utils/updateRating");
    
    const listings = await Listing.find({});
    let count = 0;
    
    for (const l of listings) {
        await updateRating(l._id);
        count++;
    }
    res.send(`Done. Recalculated ratings for ${count} listings.`);
}));

// Show, Update, and Delete Routes
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.array('listing[image]'), // Now correctly uses the 8 MB file size limit configuration
        normalizeCategory,
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
