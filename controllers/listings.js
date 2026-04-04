const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js"); 

// Helper function for Geocoding with Fallback logic
async function getCoordinates(listingData) {
    let baseLoc = `${listingData.location}, ${listingData.country}`;
    
    try {
        // 1. If user provided a landmark, try for absolute pinpoint accuracy
        if (listingData.landmark) {
            let exactQuery = `${listingData.landmark}, ${baseLoc}`;
            let response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_KEY}&q=${encodeURIComponent(exactQuery)}&format=json`);
            let geoData = await response.json();
            
            if (geoData && geoData.length > 0 && geoData[0].lat) {
                return [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
            }
        }
        
        // 2. FALLBACK: If no landmark, or if API couldn't find the landmark, search just the city
        let response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_KEY}&q=${encodeURIComponent(baseLoc)}&format=json`);
        let geoData = await response.json();
        
        if (geoData && geoData.length > 0 && geoData[0].lat) {
            return [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
        }
    } catch (err) {
        console.log("Geocoding Error:", err);
    }
    
    // 3. ULTIMATE FALLBACK: Center of India if everything fails
    return [78.9629, 20.5937]; 
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({
    path:"reviews",
    populate:{ path:"author" }
  }).populate("owner");
  
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!"); 
    return res.redirect("/"); 
  } 
  res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listings"); 
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // --- Geocoding Logic ---
    const coords = await getCoordinates(req.body.listing);
    newListing.geometry = { type: "Point", coordinates: coords };

    // --- MULTIPLE IMAGES LOGIC ---
    // req.files (plural) is an array provided by multer
    if(req.files && req.files.length > 0) {
        newListing.image = req.files.map(f => ({ 
            url: f.path, 
            filename: f.filename 
        }));
    }

    await newListing.save();
    req.flash("success", "New Listing Created!"); 
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  } 

  // FIX: Access the first image in the array for the preview
  let originalImageUrl = "";
  if (listing.image && listing.image.length > 0) {
      originalImageUrl = listing.image[0].url;
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
}
module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listings");
    }
    let { id } = req.params;

    // 1. Find the listing first (Don't use findByIdAndUpdate yet)
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // 2. Update text fields manually
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.price = req.body.listing.price;
    listing.landmark = req.body.listing.landmark;

    // 3. Update Coordinates
    const coords = await getCoordinates(req.body.listing);
    listing.geometry = { type: "Point", coordinates: coords };

    // 4. ADD NEW IMAGES (The part that was failing)
    if (req.files && req.files.length > 0) {
        let newImages = req.files.map(f => ({ 
            url: f.path, 
            filename: f.filename 
        }));
        listing.image.push(...newImages); // This now works perfectly on the 'listing' instance
    }

    // 5. SAVE ALL CHANGES (Text + New Images + Geocoding)
    await listing.save();

    // 6. DELETE SELECTED IMAGES (Do this LAST)
    if (req.body.deleteImages) {
        await listing.updateOne({ 
            $pull: { image: { filename: { $in: req.body.deleteImages } } } 
        });
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!"); 
  res.redirect("/listings");
}