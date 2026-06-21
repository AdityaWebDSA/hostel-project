const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const CATEGORIES = require("../utils/categories");
const { BILLING_PLANS } = require("../utils/billingPlans");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    location: String,
    country: String,
    landmark: String,
    contactNumber: {
        type: String,
        trim: true,
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: [String],
        enum: CATEGORIES.map(c => c.key),
        default: [],
    },
    // Owner sets which billing plans their listing accepts
    billingPlans: {
        type: [String],
        enum: BILLING_PLANS.map(p => p.key),
        default: ["monthly"],
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
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