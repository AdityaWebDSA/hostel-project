const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");

// Signup
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// Login
router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );

// Logout
router.get("/logout", userController.logout);
// Google OAuth
router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }),
    (req, res) => {
        req.flash("success", `Welcome, ${req.user.username}!`);
        res.redirect("/listings");
    }
);
// Email verification
router.get("/verify-email/:token", wrapAsync(userController.verifyEmail));
router.post("/resend-verification", isLoggedIn, wrapAsync(userController.resendVerification));

// Forgot / reset password
router.route("/forgot-password")
    .get(userController.renderForgotForm)
    .post(wrapAsync(userController.sendResetEmail));

router.route("/reset-password/:token")
    .get(wrapAsync(userController.renderResetForm))
    .post(wrapAsync(userController.resetPassword));

module.exports = router;