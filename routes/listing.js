const express = require("express");
const router=express.Router();
const wrapAsync = require("../inities/wrapAsync");
const Listing = require("../models/listing.js");
const ExpressError = require("../inities/ExpressError");
const{listingSchema ,reviewSchema}=require("../Schema.js");
const {islogin} = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer  = require('multer');
const { storage } = require("../config.js");
const upload = multer({ storage });

router.route("/")
.get( wrapAsync(listingController.index)).
post( islogin, upload.single("listing[image]"),
wrapAsync(listingController.createnewlisting),
 );

//wrapAsync(listingController.createnewlisting)
//(req,res)=>{
   // res.send(req.file);
//New form
router.get("/new", islogin,listingController.newform);




// Show
router.route("/:id")
.get( wrapAsync(listingController.showlisting))
.put( islogin, wrapAsync(listingController.updatelisting));


//Edit form
router.get("/:id/edit", wrapAsync(listingController.editlisting));

router.delete("/:id", listingController.deletelisting);

module.exports=router;