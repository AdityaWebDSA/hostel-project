const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const notifController = require("../controllers/notifications.js");

router.get("/", isLoggedIn, wrapAsync(notifController.list));
router.get("/unread-count", isLoggedIn, wrapAsync(notifController.unreadCount));
router.post("/:id/read", isLoggedIn, wrapAsync(notifController.markRead));
router.post("/mark-all-read", isLoggedIn, wrapAsync(notifController.markAllRead));

module.exports = router;