const Listing = require("../models/listing.js");

module.exports.index=async (req, res) => {
  let allListing = await Listing.find();
  res.render("listing/index.ejs", { allListing });
}

module.exports.newform=(req, res) => {
  
  res.render("listing/new.ejs");
}

/*module.exports.showlisting=async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id).populate("reviews").populate("owner");
  res.render("listing/show.ejs", { listing,currentUser:req.user });
}*/
module.exports.showlisting = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // populate the author inside each review
        select: "username" // only bring username (optional)
      }
    })
    .populate("owner");

  res.render("listing/show.ejs", { listing, currentUser: req.user });
};


module.exports.createnewlisting =async (req, res) => {
  let url = req.file.path;
  let filename=req.file.filename;

  let listingdata = new Listing(req.body.listing);
  listingdata.owner =req.user._id;
  listingdata.image={url,filename};
  await listingdata.save();
  
  req.flash("success","create  new listing successfully");
  res.redirect("/listings");
}

module.exports.editlisting=async (req, res) => {
  let { id } = req.params;
  let listingdata = await Listing.findById(id);
   let originalurl= listingdata.image.url;
   originalurl.replace("/upload","/upload/h_200");
  res.render("listing/edit.ejs", { listingdata ,originalurl});
}

module.exports.updatelisting=async (req, res) => {
  

  let { id } = req.params;
    
  let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(req.file){
let url = req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  listing.save();
  }
  
  req.flash("success", "Listing updated successfully");
  res.redirect(`/listings/${id}`);
}
module.exports.deletelisting = async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted successfully");
  res.redirect("/listings");
};
