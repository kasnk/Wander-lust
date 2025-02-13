const express = require("express");
const router = express.Router();

const User = require("../models/User");

// Registration Route (GET)
router.get("/register", (req, res) => {
    res.render("includes/register");
});

// Registration Route (POST)
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        
        req.flash("success", "Registration successful! Please log in.");
        res.redirect("/login");  // ✅ Redirects to login page after registration
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");  // If registration fails, stay on register page
    }
});

// Login Route (GET)
router.get("/login", (req, res) => {
    res.render("includes/login");
});

// Login Route (POST)
const passport = require("passport");

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");  // ✅ Redirects after successful login
});


// Logout Route
router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out.");
        res.redirect("/login");  // ✅ Redirects to login page after logout
    });
});

module.exports = router;
