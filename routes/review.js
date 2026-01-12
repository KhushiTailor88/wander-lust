const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ mergeParams is IMPORTANT
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../inities/wrapAsync");
const { islogin } = require("../middleware");

// POST → Create Review
router.post("/", islogin, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const review = new Review(req.body.review);
  review.author = req.user._id; // logged in user as author

  await review.save();
  listing.reviews.push(review);
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
}));

// DELETE → Remove Review
router.delete("/:reviewId", islogin, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  // remove review reference from listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // remove review document itself
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;
