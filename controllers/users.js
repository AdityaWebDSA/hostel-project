const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        // Sanitize inputs
        username = username.trim();
        email = email.trim().toLowerCase();

        // Basic server-side guards (defense-in-depth beyond client validation)
        if (username.length < 3) {
            req.flash("error", "Username must be at least 3 characters.");
            return res.redirect("/signup");
        }
        if (password.length < 6) {
            req.flash("error", "Password must be at least 6 characters.");
            return res.redirect("/signup");
        }

        // Check if email already in use (passport-local-mongoose only checks username)
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash("error", "An account with that email already exists.");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to UniNest, ${username}! 🎉`);
            res.redirect("/listings");
        });

    } catch (err) {
        // passport-local-mongoose throws a specific error for duplicate usernames
        if (err.name === "UserExistsError") {
            req.flash("error", "That username is already taken. Please choose another.");
        } else {
            req.flash("error", err.message);
        }
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) return next(err);
        req.flash("success", "You've been logged out. See you soon!");
        res.redirect("/listings");
    });
};