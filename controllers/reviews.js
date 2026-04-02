const Listing=require("../models/listing");
const Review=require("../models/review");


module.exports.createReview=async(req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  
  newReview.author = req.user._id; // Brilliant job adding this!
  listing.reviews.push(newReview);
  
  await newReview.save();
  await listing.save();
  
  req.flash("success", "New Review Added!");
  res.redirect(`/listings/${listing._id}#reviews-section`);
};

module.exports.destroyReview=async (req, res) => {
    let { id, reviewId } = req.params;
    
    // Pull the review ID from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // Delete the actual review document from the reviews collection
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review Deleted!"); 
    res.redirect(`/listings/${id}#reviews-section`);
  }