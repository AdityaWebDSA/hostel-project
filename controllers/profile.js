const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const SavedListing = require("../models/savedListing.js");
const Review = require("../models/review.js");
const { cloudinary } = require("../cloudConfig.js");

module.exports.showProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    const [listingCount, bookingCount, savedCount, recentListings] = await Promise.all([
        Listing.countDocuments({ owner: req.user._id }),
        Booking.countDocuments({ tenant: req.user._id }),
        SavedListing.countDocuments({ user: req.user._id }),
        Listing.find({ owner: req.user._id }).sort({ _id: -1 }).limit(3),
    ]);

    res.render("users/profile.ejs", {
        user,
        listingCount,
        bookingCount,
        savedCount,
        recentListings,
    });
};

module.exports.renderEditProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/edit-profile.ejs", { user });
};

module.exports.updateProfile = async (req, res) => {
    const { bio, phone } = req.body.user;
    const user = await User.findById(req.user._id);

    user.bio = bio || "";
    user.phone = phone || "";

    if (req.file) {
        if (user.avatar && user.avatar.filename) {
            await cloudinary.uploader.destroy(user.avatar.filename);
        }
        user.avatar = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await user.save();
    req.flash("success", "Profile updated!");
    res.redirect("/profile");
};