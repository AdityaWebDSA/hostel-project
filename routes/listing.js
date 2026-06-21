const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const { isLoggedIn, isOwner, validateListing, normalizeCategory } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

// Multer Setup
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index & Create Route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.array('listing[image]', 5),
        normalizeCategory,
        validateListing,
        wrapAsync(listingController.createListing)
    );

// These must stay ABOVE /:id so Express doesn't treat "new"/"search"/"mylisting" as an ID
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/search", wrapAsync(listingController.searchListings));
router.get("/mylisting", isLoggedIn, wrapAsync(listingController.myListings));

// Show, Update, and Delete Routes
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.array('listing[image]'),
        normalizeCategory,
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;