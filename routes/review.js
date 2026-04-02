const express = require("express");
// mergeParams: true is REQUIRED so this file can access the :id from app.js
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const reviewController=require("../controllers/reviews.js");
// ✅ FIX: Capitalized the 'R' in isReviewAuthor to match your middleware file
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js"); 

// POST Route: Create a Review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// DELETE Route: Delete a Review
// ✅ FIX: Capitalized the 'R' here as well
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;