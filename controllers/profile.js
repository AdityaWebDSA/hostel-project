const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");

module.exports.showProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    const listingCount = await Listing.countDocuments({ owner: req.user._id });
    res.render("users/profile.ejs", { user, listingCount });
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
        // Delete old avatar from Cloudinary if one exists, to avoid orphaned files
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