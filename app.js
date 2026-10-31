
// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
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
const Notification = require("./models/notification.js");
const ExpressError = require("./utils/ExpressError.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const savedRouter = require("./routes/saved.js");
const bookingRouter = require("./routes/bookings.js");
const profileRouter = require("./routes/profile.js");
const notificationRouter = require("./routes/notifications.js");
const staticRouter = require("./routes/static.js");

// Environment Variables
const dbUrl = process.env.ATLASDB_URL;
const secret = process.env.SECRET;
const port = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === "production";

// Validate Environment Variables
if (!dbUrl) {
    throw new Error("ATLASDB_URL is missing in environment variables.");
}

if (!secret) {
    throw new Error("SECRET is missing in environment variables.");
}

// Trust Proxy for Vercel/Render HTTPS session cookies
if (isProduction) {
    app.set("trust proxy", 1);
}

// Connect to MongoDB
mongoose.connect(dbUrl)
    .then(() => console.log("Connected to MongoDB successfully."))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// View Engine Configuration
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// General Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("MongoDB Session Store Error:", err);
});

// Session Configuration
const sessionOptions = {
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
    },
};

// Session & Flash Middleware
app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Google Username Generator
async function generateUniqueGoogleUsername(profile) {
    const email = profile.emails?.[0]?.value || "";

    const base = (
        profile.displayName ||
        email.split("@")[0] ||
        "googleuser"
    )
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase() || "googleuser";

    let username = base;
    let attempt = 0;

    while (await User.findOne({ username })) {
        attempt++;
        username = `${base}_${attempt}`;
    }

    return username;
}

// Google OAuth Configuration
const googleCallbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:8080/auth/google/callback";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: googleCallbackURL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value?.toLowerCase();

                    if (!email) {
                        return done(
                            new Error("Google account does not provide an email address.")
                        );
                    }

                    let user = await User.findOne({ googleId: profile.id });

                    if (user) return done(null, user);

                    user = await User.findOne({ email });

                    if (user) {
                        user.googleId = profile.id;

                        if (!user.avatar?.url && profile.photos?.[0]?.value) {
                            user.avatar = {
                                url: profile.photos[0].value,
                                filename: "google",
                            };
                        }

                        user.isVerified = true;
                        await user.save();

                        return done(null, user);
                    }

                    const username = await generateUniqueGoogleUsername(profile);

                    const newUser = new User({
                        email,
                        username,
                        googleId: profile.id,
                        isVerified: true,
                        avatar: profile.photos?.[0]?.value
                            ? {
                                url: profile.photos[0].value,
                                filename: "google",
                            }
                            : {
                                url: "",
                                filename: "",
                            },
                    });

                    await newUser.save();

                    return done(null, newUser);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );
} else {
    console.warn(
        "Google OAuth disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing."
    );
}

// Global Locals Middleware
app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;

    if (req.user?.isBanned) {
        return req.logOut((err) => {
            if (err) return next(err);

            req.flash("error", "Your account has been suspended.");

            return res.redirect("/login");
        });
    }

    try {
        if (req.user) {
            res.locals.unreadNotifCount = await Notification.countDocuments({
                user: req.user._id,
                read: false,
            });
        } else {
            res.locals.unreadNotifCount = 0;
        }

        next();
    } catch (err) {
        next(err);
    }
});

// ========================================
// ROUTES
// ========================================

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/admin", adminRouter);
app.use("/listings", listingRouter);
app.use("/saved", savedRouter);
app.use("/bookings", bookingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/profile", profileRouter);
app.use("/notifications", notificationRouter);
app.use("/", staticRouter);

// ========================================
// ERROR HANDLING
// ========================================

// Express 5 compatible wildcard route
app.all("/{*splat}", (req, res, next) => {
    next(
        new ExpressError(
            404,
            "The page you're looking for doesn't exist or has been moved."
        )
    );
});

// Multer File Size Error Handler
app.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        req.flash(
            "error",
            "One of your images is too large. Maximum file size is 8 MB."
        );

        return res.redirect("back");
    }

    next(err);
});

// Final Error Handler
app.use((err, req, res, _next) => {
    void _next;

    void _next;

    let {
        statusCode = 500,
        message = "Something went wrong!",
    } = err;

    if (statusCode === 500) {
        message = "Something went wrong! Please try again later.";
    }

    res.status(statusCode).render("error.ejs", {
        message,
        statusCode,
    });
});

// Standard local listener
if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;
