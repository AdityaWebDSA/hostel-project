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
            `/listings/${listing._id}`
        );
    }

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    await updateRating(id);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};