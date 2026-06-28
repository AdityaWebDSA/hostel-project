const Listing = require("../models/listing");
const Review = require("../models/review");
const notify = require("../utils/notify");
const updateRating = require("../utils/updateRating");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    await updateRating(listing._id);

    if (listing.owner && !listing.owner.equals(req.user._id)) {
        await notify(
            listing.owner,
            "new_review",
            `${req.user.username} left a review on "${listing.title}"`,
            `/listings/${listing._id}#reviews-section`
        );
    }
    req.flash("success", "Review added!");
    res.redirect(`/listings/${listing._id}#reviews-section`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    await updateRating(id);
    req.flash("success", "Review deleted.");
    res.redirect(`/listings/${id}#reviews-section`);
};

// Add a reply to a review (any logged-in user)
module.exports.addReply = async (req, res) => {
    const { id, reviewId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
        req.flash("error", "Reply cannot be empty.");
        return res.redirect(`/listings/${id}#reviews-section`);
    }

    const listing = await Listing.findById(id);
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }

    const isOwner = listing && listing.owner.equals(req.user._id);

    review.replies.push({
        author: req.user._id,
        text: text.trim(),
        isOwnerReply: isOwner,
    });

    await review.save();
    res.redirect(`/listings/${id}#review-${reviewId}`);
};

// Delete a reply (reply author or listing owner)
module.exports.deleteReply = async (req, res) => {
    const { id, reviewId, replyId } = req.params;

    const listing = await Listing.findById(id);
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }

    const reply = review.replies.id(replyId);
    if (!reply) {
        req.flash("error", "Reply not found.");
        return res.redirect(`/listings/${id}#reviews-section`);
    }

    const isReplyAuthor = reply.author.equals(req.user._id);
    const isListingOwner = listing && listing.owner.equals(req.user._id);

    if (!isReplyAuthor && !isListingOwner) {
        req.flash("error", "Not authorised.");
        return res.redirect(`/listings/${id}#reviews-section`);
    }

    review.replies.pull({ _id: replyId });
    await review.save();
    res.redirect(`/listings/${id}#review-${reviewId}`);
};

// Toggle like on a review
module.exports.toggleReviewLike = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(reviewId);
    if (!review) return res.json({ error: "Not found" });

    const likedIdx = review.likes.indexOf(userId);
    const dislikedIdx = review.dislikes.indexOf(userId);

    if (likedIdx > -1) {
        review.likes.splice(likedIdx, 1); // unlike
    } else {
        review.likes.push(userId);
        if (dislikedIdx > -1) review.dislikes.splice(dislikedIdx, 1); // remove dislike
    }

    await review.save();
    res.json({ likes: review.likes.length, dislikes: review.dislikes.length });
};

// Toggle dislike on a review
module.exports.toggleReviewDislike = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(reviewId);
    if (!review) return res.json({ error: "Not found" });

    const dislikedIdx = review.dislikes.indexOf(userId);
    const likedIdx = review.likes.indexOf(userId);

    if (dislikedIdx > -1) {
        review.dislikes.splice(dislikedIdx, 1);
    } else {
        review.dislikes.push(userId);
        if (likedIdx > -1) review.likes.splice(likedIdx, 1);
    }

    await review.save();
    res.json({ likes: review.likes.length, dislikes: review.dislikes.length });
};

// Toggle like on a reply
module.exports.toggleReplyLike = async (req, res) => {
    const { reviewId, replyId } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(reviewId);
    if (!review) return res.json({ error: "Not found" });

    const reply = review.replies.id(replyId);
    if (!reply) return res.json({ error: "Not found" });

    const likedIdx = reply.likes.findIndex(id => id.equals(userId));
    const dislikedIdx = reply.dislikes.findIndex(id => id.equals(userId));

    if (likedIdx > -1) {
        reply.likes.splice(likedIdx, 1);
    } else {
        reply.likes.push(userId);
        if (dislikedIdx > -1) reply.dislikes.splice(dislikedIdx, 1);
    }

    await review.save();
    res.json({ likes: reply.likes.length, dislikes: reply.dislikes.length });
};

// Toggle dislike on a reply
module.exports.toggleReplyDislike = async (req, res) => {
    const { reviewId, replyId } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(reviewId);
    if (!review) return res.json({ error: "Not found" });

    const reply = review.replies.id(replyId);
    if (!reply) return res.json({ error: "Not found" });

    const dislikedIdx = reply.dislikes.findIndex(id => id.equals(userId));
    const likedIdx = reply.likes.findIndex(id => id.equals(userId));

    if (dislikedIdx > -1) {
        reply.dislikes.splice(dislikedIdx, 1);
    } else {
        reply.dislikes.push(userId);
        if (likedIdx > -1) reply.likes.splice(likedIdx, 1);
    }

    await review.save();
    res.json({ likes: reply.likes.length, dislikes: reply.dislikes.length });
};