const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { PRICE_PLANS } = require("../utils/pricePlans");
const notify = require("../utils/notify");
const { smallThumb } = require("../utils/cloudinaryHelpers");
// Tenant creates a booking request
module.exports.createBooking = async (req, res) => {
    const { id } = req.params; // listing id
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You can't book your own listing.");
        return res.redirect(`/listings/${id}`);
    }

    const { billingPlan, moveInDate, message } = req.body.booking;

  // pricePlan is now a single field on the listing — any plan from PRICE_PLANS is valid
    if (!billingPlan) {
        req.flash("error", "Please select a billing plan.");
        return res.redirect(`/listings/${id}`);
    }

    await Booking.create({
        listing: listing._id,
        tenant: req.user._id,
        owner: listing.owner,
        billingPlan,
        moveInDate,
        message: message || "",
        priceAtRequest: listing.price,
    });

    await notify(
        listing.owner,
        "booking_request",
        `${req.user.username} requested to book "${listing.title}"`,
        `/bookings/received`
    );

    req.flash("success", "Booking request sent! The owner will respond soon.");
    res.redirect("/bookings");
};

// Tenant's view: requests they've sent
module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ tenant: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });
res.render("bookings/my-bookings.ejs", { bookings, PRICE_PLANS, role: "tenant", smallThumb });
};

// Owner's view: requests they've received
module.exports.receivedBookings = async (req, res) => {
    const bookings = await Booking.find({ owner: req.user._id })
        .populate("listing")
        .populate("tenant")
        .sort({ createdAt: -1 });
const { smallThumb } = require("../utils/cloudinaryHelpers");
res.render("bookings/my-bookings.ejs", { bookings, PRICE_PLANS, role: "owner", smallThumb });
};

// Owner approves or rejects
module.exports.respondToBooking = async (req, res) => {
    const { id } = req.params; // booking id
    const { action } = req.body; // "confirm" or "reject"

    const booking = await Booking.findById(id);
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings/received");
    }

    if (!booking.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that.");
        return res.redirect("/bookings/received");
    }

    if (booking.status !== "pending") {
        req.flash("error", "This booking has already been responded to.");
        return res.redirect("/bookings/received");
    }

   booking.status = action === "confirm" ? "confirmed" : "rejected";
    await booking.save();

    const listing = await Listing.findById(booking.listing);
    await notify(
        booking.tenant,
        "booking_status",
        `Your booking request for "${listing ? listing.title : 'a listing'}" was ${booking.status}`,
        `/bookings`
    );

    req.flash("success", `Booking ${booking.status}.`);
    res.redirect("/bookings/received");
};

// Tenant cancels their own pending/confirmed request
module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings");
    }

    if (!booking.tenant.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that.");
        return res.redirect("/bookings");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled.");
    res.redirect("/bookings");
};