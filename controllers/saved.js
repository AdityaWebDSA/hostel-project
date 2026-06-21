const SavedListing = require("../models/savedListing.js");
const Listing = require("../models/listing.js");
const { cardThumb } = require("../utils/cloudinaryHelpers");

module.exports.toggleSave = async (req, res) => {
    const { id } = req.params; // listing id
    const userId = req.user._id;

    const existing = await SavedListing.findOne({ user: userId, listing: id });

    if (existing) {
        await SavedListing.findByIdAndDelete(existing._id);
        return res.json({ saved: false });
    } else {
        // Make sure the listing actually exists before saving a reference to it
        const listingExists = await Listing.exists({ _id: id });
        if (!listingExists) {
            return res.status(404).json({ error: "Listing not found" });
        }
        await SavedListing.create({ user: userId, listing: id });
        return res.json({ saved: true });
    }
};

module.exports.mySaved = async (req, res) => {
    const CATEGORIES = require("../utils/categories");
    const saved = await SavedListing.find({ user: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });

    // Filter out any saved entries whose listing was deleted later
    const listings = saved
        .filter(s => s.listing !== null)
        .map(s => s.listing);

res.render("listings/saved.ejs", { listings, CATEGORIES, cardThumb });
};