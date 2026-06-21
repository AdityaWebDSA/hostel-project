const express = require("express");
const router = express.Router();

router.get("/about", (req, res) => res.render("static/about.ejs"));
router.get("/help", (req, res) => res.render("static/help.ejs"));

module.exports = router;