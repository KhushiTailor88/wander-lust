const Listing = require("../models/listing.js");

module.exports.index=async (req, res) => {
  let { q } = req.query;
  let allListing;
  if (q) {
    allListing = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } }
      ]
    });
  } else {
    allListing = await Listing.find();
  }
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


const DEFAULT_LISTING_IMAGE = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60";

const getFileUrl = (file) => {
  if (!file) return null;
  return file.path || file.url || file.secure_url || null;
};

const getUploadedFile = (req) => {
  if (!req.files) return null;
  if (req.files.image && req.files.image.length) return req.files.image[0];
  if (req.files['listing[image]'] && req.files['listing[image]'].length) return req.files['listing[image]'][0];
  return null;
};

module.exports.createnewlisting = async (req, res) => {
  const uploadedFile = getUploadedFile(req);
  const fileUrl = getFileUrl(uploadedFile);
  const filename = uploadedFile ? (uploadedFile.filename || uploadedFile.originalname) : "listingimage";

  let listingdata = new Listing(req.body.listing);
  listingdata.owner = req.user._id;
  listingdata.image = {
    url: fileUrl || DEFAULT_LISTING_IMAGE,
    filename,
  };
  await listingdata.save();
  
  req.flash("success", "create  new listing successfully");
  res.redirect("/listings");
}

module.exports.editlisting = async (req, res) => {
  let { id } = req.params;
  let listingdata = await Listing.findById(id);
  if (!listingdata) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  const originalurl = (listingdata.image && listingdata.image.url) ? listingdata.image.url : DEFAULT_LISTING_IMAGE;
  const thumbnailUrl = originalurl.replace("/upload", "/upload/h_200");
  res.render("listing/edit.ejs", { listingdata, originalurl: thumbnailUrl });
}

module.exports.updatelisting = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });
  if (req.file) {
    const fileUrl = getFileUrl(req.file);
    const filename = req.file.filename || req.file.originalname;
    listing.image = {
      url: fileUrl || DEFAULT_LISTING_IMAGE,
      filename,
    };
    await listing.save();
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
