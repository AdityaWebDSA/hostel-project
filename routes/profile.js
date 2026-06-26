const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../express-middleware.js");
const profileController = require("../controllers/profile.js");

const multer = require('multer');
const { avatarStorage } = require("../cloudConfig.js");
const upload = multer({ storage: avatarStorage });

router.get("/", isLoggedIn, wrapAsync(profileController.showProfile));
router.get("/edit", isLoggedIn, wrapAsync(profileController.renderEditProfile));
router.put("/", isLoggedIn, upload.single('user[avatar]'), wrapAsync(profileController.updateProfile));

module.exports = router;