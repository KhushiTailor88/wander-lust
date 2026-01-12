const express = require("express");
const router=express.Router();
const User = require("../models/user.js");
const passport = require('passport');
const wrapAsync = require("../inities/wrapAsync");

router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
     let registereduser= await User.register(newUser, password);
    req.login(registereduser,(err)=>{
      if(err){
       return next(err);
      }
      req.flash("success", "User registered successfully! ");
    res.redirect("/listings");   // redirect to login page
    });
    
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

//login
router.get("/login", (req, res) => {
  res.render("user/login.ejs");
});
router.post("/login",passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),
(req,res)=>{
req.flash("success","welcome back to wanderlust!")
res.redirect("/listings");
})

//logout
router.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      next(err);
    }
    req.flash("success","you are logout");
    res.redirect("/listings");
  }
  )
})
module.exports = router;