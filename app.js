// WanderStay – Stay while you wander
if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const listingController = require("./controllers/listing.js");

// session and flash middleware
const session = require("express-session");
const MongoStore = require("connect-mongo");  // session store
const flash = require("connect-flash");

// passport middleware
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");


// ✅ Add the timeout middleware at the beginning
app.use((req, res, next) => {
  res.setTimeout(15000, () => { // 15 seconds timeout
    console.log("Request timed out.");
    res.status(504).send("Server timeout");
  });
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderstay";
// main()
//   .then(() => console.log("connection successful "))
//   .catch((err) => console.log(err));
// async function main() {
//   await mongoose.connect(MONGO_URL);
// }
// const dbUrl = process.env.MONGO_URL;
const dbUrl = process.env.ATLAS_URL;


async function connectDB(retries = 5) {
  while (retries) {
    try {
      await mongoose.connect(dbUrl);
      console.log("Database connected successfully");
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
      return; // Exit loop on successful connection
    } catch (err) {
      console.error(`Database connection failed: ${err.message}`);
      console.error(
        ` Database connection failed. Retries left: ${retries - 1}`
      );
      retries--;
      if (retries === 0) {
        console.error("All retries failed. Exiting...");
        process.exit(1); 
      }
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5 sec before retrying
    }
  }
}
connectDB();



const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: {
    secret: process.env.SECRET, 
    },
});

store.on("error", function (e) {
  console.log("Error in MONGO SESSION STORE", e);
});

// session  middleware
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, //prevent cross site scripting attacks
    expires: Date.now() + 1000 * 60 * 60 * 24 * 30, //30 days
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
};


app.use(session(sessionOptions));
app.use(flash());

// passport authentication middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Global variables middleware (after Passport)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// routes
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");
const wrapAsync = require("./utils/wrapAsync.js");

app.get("/", wrapAsync(listingController.index)
);

// routes
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/dashboard", (req, res) => {
  console.log(req.user); // Check if user is authenticated
  res.send("dashboard");
});
app.get("/unavailable", (req, res, next) => {
  next(new ExpressError(404, " This feature is currently unavailable."));
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode, message = "something went wrong!" } = err;
  res.status(statusCode || 404).render("listings/error.ejs", { err });
  // res.status(statusCode || 500).send( message );
});

// const port = 3000;
// app.listen(port, () => {
//   console.log(`Listening on port ${port}`);
// });

module.exports = app;