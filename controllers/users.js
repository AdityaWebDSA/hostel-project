const crypto = require("crypto");
const User = require("../models/user.js");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/mailer.js");

// ── Helpers ──
function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}

function siteUrl(req) {
    return `${req.protocol}://${req.get("host")}`;
}

// ── Signup ──
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        username = username.trim();
        email = email.trim().toLowerCase();

        if (username.length < 3) {
            req.flash("error", "Username must be at least 3 characters.");
            return res.redirect("/signup");
        }
        if (password.length < 6) {
            req.flash("error", "Password must be at least 6 characters.");
            return res.redirect("/signup");
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash("error", "An account with that email already exists.");
            return res.redirect("/signup");
        }

        const token = generateToken();
        const newUser = new User({
            email,
            username,
            isVerified: false,
            verificationToken: token,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
        });

        const registeredUser = await User.register(newUser, password);

        // Send verification email (non-blocking — don't fail signup if email fails)
        const verifyUrl = `${siteUrl(req)}/verify-email/${token}`;
        sendVerificationEmail(email, username, verifyUrl).catch(err =>
            console.error("Verification email failed:", err)
        );

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to UniNest, ${username}! Check your email to verify your account.`);
            res.redirect("/listings");
        });

    } catch (err) {
        if (err.name === "UserExistsError") {
            req.flash("error", "That username is already taken. Please choose another.");
        } else {
            req.flash("error", err.message);
        }
        res.redirect("/signup");
    }
};

// ── Verify email ──
module.exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        req.flash("error", "Verification link is invalid or has expired.");
        return res.redirect("/listings");
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    req.flash("success", "Email verified! Your account is fully active.");
    res.redirect("/listings");
};

// ── Resend verification email ──
module.exports.resendVerification = async (req, res) => {
    if (!req.user) return res.redirect("/login");
    if (req.user.isVerified) {
        req.flash("success", "Your email is already verified.");
        return res.redirect("/listings");
    }

    const token = generateToken();
    await User.findByIdAndUpdate(req.user._id, {
        verificationToken: token,
        verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyUrl = `${siteUrl(req)}/verify-email/${token}`;
    sendVerificationEmail(req.user.email, req.user.username, verifyUrl).catch(err =>
        console.error("Resend verification email failed:", err)
    );

    req.flash("success", "Verification email resent! Check your inbox.");
    res.redirect("back");
};

// ── Forgot password — render form ──
module.exports.renderForgotForm = (req, res) => {
    res.render("users/forgot-password.ejs");
};

// ── Forgot password — send reset email ──
module.exports.sendResetEmail = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
        req.flash("error", "Please enter your email address.");
        return res.redirect("/forgot-password");
    }

    // Always show the same message whether the email exists or not
    // This prevents user enumeration attacks
    const user = await User.findOne({ email });
    if (user) {
        const token = generateToken();
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const resetUrl = `${siteUrl(req)}/reset-password/${token}`;
        sendPasswordResetEmail(email, user.username, resetUrl).catch(err =>
            console.error("Password reset email failed:", err)
        );
    }

    req.flash("success", "If that email is registered, a reset link has been sent. Check your inbox.");
    res.redirect("/forgot-password");
};


// ── Reset password — render form ──
module.exports.renderResetForm = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        req.flash("error", "Password reset link is invalid or has expired.");
        return res.redirect("/forgot-password");
    }

    res.render("users/reset-password.ejs", { token });
};

// ── Reset password — handle form submit ──
module.exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect(`/reset-password/${token}`);
    }

    if (password.length < 6) {
        req.flash("error", "Password must be at least 6 characters.");
        return res.redirect(`/reset-password/${token}`);
    }

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        req.flash("error", "Password reset link is invalid or has expired.");
        return res.redirect("/forgot-password");
    }

    await user.setPassword(password); // passport-local-mongoose method
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    req.flash("success", "Password reset successfully. You can now log in.");
    res.redirect("/login");
};

// ── Login ──
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// ── Logout ──
module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) return next(err);
        req.flash("success", "You've been logged out. See you soon!");
        res.redirect("/listings");
    });
};