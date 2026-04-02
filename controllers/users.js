const User = require("../models/user.js"); // ✅ Moved from the router file!

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
   try {
    let { username, email, password } = req.body; 
    
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password); 
    
    req.login(registeredUser, (err) => {
        if(err) {
            return next(err); 
        }
        req.flash("success", "Welcome to UniNest!");
        res.redirect("/listings");
    });
    
   } catch(err) {
    req.flash("error", err.message);
    res.redirect("/signup");
   }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs"); // ✅ Cleaned up! Only does one thing now.
};

// ✅ Extracted the login logic into its own clean function
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to UniNest! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings"; 
    res.redirect(redirectUrl);   
};

// ✅ Moved logout logic from the router to the controller!
module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};