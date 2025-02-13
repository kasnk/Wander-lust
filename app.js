// Requiring Packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session=require("express-session");
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");
const userRoutes = require("./routes/users");

// Importing Routes
const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");

// Database Connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

// App Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


app.use(session({
    secret: "thisshouldbeabettersecret", // Change this in production!
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  // Security: prevents client-side access to cookies
        maxAge: 1000 * 60 * 60 * 24 // 24 hours expiration
    }
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(passport.initialize());
app.use(passport.session());

// Use local strategy with User model
passport.use(new LocalStrategy(User.authenticate()));

// Serialize & Deserialize users
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to make user available in templates
app.use((req, res, next) => {
    console.log("Middleware executed: req.user =", req.user); // Debugging log
    res.locals.currentUser = req.user || null; // Ensure it's always defined
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error","Provide valid username or password");
    next();
});


// Home Route
app.get("/", (req, res) => {
    res.send("Working!!");
});


// Using Routes
app.use("/", userRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

// Handle 404 Errors
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Start Server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`App is listening on port http://localhost:${PORT}/`);
});
