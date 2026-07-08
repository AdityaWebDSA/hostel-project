const Listing = require("../models/listing.js");
const User    = require("../models/user.js");
const Booking = require("../models/booking.js");
const Review  = require("../models/review.js");

module.exports.dashboard = async (req, res) => {
    const [totalListings, totalUsers, totalBookings, recentListings, recentUsers] =
        await Promise.all([
            Listing.countDocuments(),
            User.countDocuments(),
            Booking.countDocuments(),
            Listing.find().sort({ _id: -1 }).limit(5).select("title location owner"),
            User.find().sort({ _id: -1 }).limit(5).select("username email isVerified createdAt"),
        ]);

    res.render("admin/dashboard.ejs", {
        totalListings, totalUsers, totalBookings,
        recentListings, recentUsers,
    });
};

module.exports.allListings = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = search
        ? { $or: [
            { title: new RegExp(search, "i") },
            { location: new RegExp(search, "i") },
          ]}
        : {};

    const [listings, total] = await Promise.all([
        Listing.find(filter).populate("owner", "username email")
            .sort({ _id: -1 }).skip(skip).limit(limit),
        Listing.countDocuments(filter),
    ]);

    res.render("admin/listings.ejs", {
        listings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        search,
    });
};

module.exports.deleteListing = async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted.");
    res.redirect("/admin/listings");
};

module.exports.allUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = search
        ? { $or: [
            { username: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
          ]}
        : {};

    const [users, total] = await Promise.all([
        User.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
    ]);

    res.render("admin/users.ejs", { users, total, page,
        totalPages: Math.ceil(total / limit), search });
};

module.exports.banUser = async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isBanned: true });
    req.flash("success", "User banned.");
    res.redirect("/admin/users");
};

module.exports.unbanUser = async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isBanned: false });
    req.flash("success", "User unbanned.");
    res.redirect("/admin/users");
};