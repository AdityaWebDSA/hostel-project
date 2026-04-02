const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

// ✅ FIX 1: Imported validateListing from middleware, removed the broken model import
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js"); 
const listingController = require("../controllers/listings.js");

// Multer Setup
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index & Create Route
router.route("/")
    .get(wrapAsync(listingController.index))
    // ✅ FIX 2: Swapped the order. Multer parses the form FIRST, then Joi validates it.
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

// New Route (Must stay ABOVE /:id so Express doesn't think "new" is an ID)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update, and Delete Routes
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;