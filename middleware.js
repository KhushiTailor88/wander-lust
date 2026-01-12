// middleware.js
module.exports.islogin = (req, res, next) => {
    req.session.redirectUrl = req.orignalUrl;
  if (!req.isAuthenticated()) {
    req.flash("error", "You must login first");
    return res.redirect("/login");
  }
  next();
};
