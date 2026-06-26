const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../express-middleware.js");
const savedController = require("../controllers/saved.js");

router.get("/", isLoggedIn, wrapAsync(savedController.mySaved));
router.post("/toggle/:id", isLoggedIn, wrapAsync(savedController.toggleSave));

module.exports = router;