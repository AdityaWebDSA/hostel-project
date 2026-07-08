const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const adminController = require("../controllers/admin.js");

// All admin routes require isAdmin middleware
router.use(isAdmin);

router.get("/",            wrapAsync(adminController.dashboard));
router.get("/listings",    wrapAsync(adminController.allListings));
router.delete("/listings/:id", wrapAsync(adminController.deleteListing));
router.get("/users",       wrapAsync(adminController.allUsers));
router.post("/users/:id/ban",   wrapAsync(adminController.banUser));
router.post("/users/:id/unban", wrapAsync(adminController.unbanUser));

module.exports = router;