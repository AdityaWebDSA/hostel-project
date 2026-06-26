const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const CATEGORIES = require("../utils/categories");
const { PRICE_PLANS } = require("../utils/pricePlans");

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    image: [{ url: String, filename: String }],
    price: Number,
    // How the price is charged — replaces the old billingPlans array
    pricePlan: {
        type: String,
        enum: PRICE_PLANS.map(p => p.key),
        default: "monthly",
    },
    location: String,
    country: String,
    landmark: String,
    contactNumber: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    geometry: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    category: {
        type: [String],
        enum: CATEGORIES.map(c => c.key),
        default: [],
    },
    // Selected amenities from the category-driven checklist
    amenities: {
        type: [String],
        default: [],
    },
    // Owner's free-text additions
customAmenities: {
        type: String,
        trim: true,
        default: "",
    },
    // Only relevant for hostels, PGs, independent rooms, mess
    genderPolicy: {
        type: String,
        enum: ["boys", "girls", "coed", ""],
        default: "",
    },
   reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    // Cached rating fields — updated whenever a review is added/deleted
    // Storing these avoids a populate+compute on every index page load
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
});

listingSchema.index({ geometry: "2dsphere" });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;