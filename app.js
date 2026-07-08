if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo"); 
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Models & Utils
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
console.log("Database URL Check:", dbUrl ? "URL Found" : "URL MISSING!");

// Database Connection
main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("DB Connection Error:", err);
    });

async function main() {
    if (!dbUrl) {
        throw new Error("ATLASDB_URL is not defined in .env file");
    }
    await mongoose.connect(dbUrl);
}

// View Engine & Middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Mongo Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// Session Configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // Added: Ensures cookies work over HTTPS on Render
        secure: process.env.NODE_ENV === "production", 
    },
};

// Passport & Session Middleware
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Check if email already registered (local account)
        const email = profile.emails?.[0]?.value || "";
        user = await User.findOne({ email });
        if (user) {
            // Link Google to existing account
            user.googleId = profile.id;
            if (!user.avatar?.url && profile.photos?.[0]?.value) {
                user.avatar = { url: profile.photos[0].value, filename: "google" };
            }
            user.isVerified = true; // Google already verified the email
            await user.save();
            return done(null, user);
        }

        // Create new user from Google profile
        const username = profile.displayName.replace(/\s+/g, "").toLowerCase()
            + Math.floor(Math.random() * 1000);

        const newUser = new User({
            email,
            username,
            googleId: profile.id,
            isVerified: true, // Google accounts are pre-verified
            avatar: profile.photos?.[0]?.value
                ? { url: profile.photos[0].value, filename: "google" }
                : { url: "", filename: "" },
        });

        // Register without a password (Google handles auth)
        await newUser.save();
        return done(null, newUser);

    } catch (err) {
        return done(err, null);
    }
}));
// Global Locals Middleware
app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;

    // Block banned users immediately
    if (req.user?.isBanned) {
        req.logOut((err) => {
            req.flash("error", "Your account has been suspended.");
            res.redirect("/login");
        });
        return;
    }

    if (req.user) {
        const Notification = require("./models/notification.js");
        res.locals.unreadNotifCount = await Notification.countDocuments({ user: req.user._id, read: false });
    } else {
        res.locals.unreadNotifCount = 0;
    }
    next();
});

// --- ROUTES ---

// 1. Root Route Redirect - (Place this ABOVE other routes)
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// 2. Resource Routes
const adminRouter = require("./routes/admin.js");
app.use("/admin", adminRouter);
app.use("/listings", listingRouter);
const savedRouter = require("./routes/saved.js");
app.use("/saved", savedRouter);
const bookingRouter = require("./routes/bookings.js");
app.use("/bookings", bookingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
const profileRouter = require("./routes/profile.js");
app.use("/profile", profileRouter);
const notificationRouter = require("./routes/notifications.js");
app.use("/notifications", notificationRouter);
const staticRouter = require("./routes/static.js");
app.use("/", staticRouter);

// --- ERROR HANDLING ---

// app.all("*") catches everything that didn't match the routes above
// Line 131 — change to:
app.all(/(.*)/, (req, res) => {
    res.status(404).render("error.ejs", {
        statusCode: 404,
        message: "The page you're looking for doesn't exist or has been moved."
    });
});
// Catch Multer file-size errors with a friendly message instead of a raw crash
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash("error", "One of your images is too large. Maximum file size is 8 MB.");
        return res.redirect("back");
    }
    next(err);
});
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message, statusCode });
});


const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
module.exports = app;
