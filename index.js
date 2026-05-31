if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

console.log("DEBUG ENV:", process.env.CLOUD_NAME, process.env.CLOUD_API_KEY, process.env.CLOUD_API_SECRET);


const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ejsmate = require("ejs-mate");
const joi = require("joi");
const methodOverride = require("method-override");
const path = require("path");
const listingsroutes = require("./routes/listing.js");

const reviewsroutes = require("./routes/review.js");
const usersroutes = require("./routes/user.js");

const session = require("express-session");
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');


const wrapAsync = require("./inities/wrapAsync");
const ExpressError = require("./inities/ExpressError");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");
const { listingSchema, reviewSchema } = require("./Schema.js");// not used yet

// Middleware setup
app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.use(session({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: false,
  cookie: {
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentuser = req.user;
  next();
})

app.get("/demoregister", async (req, res) => {
  const fakeUser = new User({
    username: "khushi",
    email: "khushi566"
  });
  const registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});
app.use("/", usersroutes);
app.use("/listings", listingsroutes);
app.use("/listings/:id/reviews", reviewsroutes);

//app.use("/listings/:id/reviews",reviewsroutes);


const dbUrl = process.env.MONGO_URL || process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const sessionSecret = process.env.SECRET || "thisshouldbeabettersecret";

// ✅ DB Connection
main()
  .then(() => {
    console.log("✅ Connected to DB");
    if (process.env.NODE_ENV !== "production") {
      app.listen(8080, () => {
        console.log("🚀 Server listening on port 8080");
      });
    }
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// ✅ DB Connection (Removed module.exports = app from here)

// ---------------- ROUTES ---------------- //

// Home route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/listing", (req, res) => {
  res.redirect("/listings");
});

//Test route (for sample data)
app.get("/testListing", wrapAsync(async (req, res) => {
  const sampleListing = new Listing({
    title: "My new villa",
    description: "By the beach",
    price: 1200,
    location: "Calangute",
    country: "India",
  });
  await sampleListing.save();
  res.send("Sample listing created ✅");
}));

//Error middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

module.exports = app;
