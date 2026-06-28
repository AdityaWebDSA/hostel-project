const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controllers/reviews.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../express-middleware.js");

// Create review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

// Replies
router.post("/:reviewId/replies", isLoggedIn, wrapAsync(reviewController.addReply));
router.delete("/:reviewId/replies/:replyId", isLoggedIn, wrapAsync(reviewController.deleteReply));

// Likes/dislikes — JSON API (no page reload)
router.post("/:reviewId/like", isLoggedIn, wrapAsync(reviewController.toggleReviewLike));
router.post("/:reviewId/dislike", isLoggedIn, wrapAsync(reviewController.toggleReviewDislike));
router.post("/:reviewId/replies/:replyId/like", isLoggedIn, wrapAsync(reviewController.toggleReplyLike));
router.post("/:reviewId/replies/:replyId/dislike", isLoggedIn, wrapAsync(reviewController.toggleReplyDislike));

module.exports = router;