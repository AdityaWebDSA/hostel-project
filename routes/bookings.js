const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../express-middleware.js");
const bookingController = require("../controllers/bookings.js");

// Tenant: view my sent requests
router.get("/", isLoggedIn, wrapAsync(bookingController.myBookings));

// Owner: view requests received on my listings
router.get("/received", isLoggedIn, wrapAsync(bookingController.receivedBookings));

// Create a new booking request for a listing
router.post("/listing/:id", isLoggedIn, wrapAsync(bookingController.createBooking));

// Owner responds (confirm/reject)
router.post("/:id/respond", isLoggedIn, wrapAsync(bookingController.respondToBooking));

// Tenant cancels
router.post("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;