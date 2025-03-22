const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

//new route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

//create route
module.exports.createListing = async (req, res, next) => {
  let url = req.file.path; 
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.image = { url, filename };
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listings`);
};

//show route
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

//edit route
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/ar_1.0,c_fill,h_250,w_300/bo_5px_solid_lightblue");
 // https://res.cloudinary.com/demo/image/upload/ar_1.0,c_fill,h_250/bo_5px_solid_lightblue/leather_bag_gray.jpg
  res.render("listings/edit.ejs", { listing, originalImageUrl } );
};

//update route
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });

  if(typeof req.file !== "undefined") {
    let url = req.file.path; 
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  
  req.flash("success", "Listing updated!");
  return res.redirect(`/listings/${id}`);
};

//delete route
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
