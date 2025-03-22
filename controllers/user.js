const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WanderStay!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", "The username or email is already exists");
    res.redirect("/signup");
  }
};


//login route
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};
module.exports.loginUser = async (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};


//logout route
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
};
