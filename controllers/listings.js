const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js"); 
const { cardThumb, detailImage, smallThumb } = require("../utils/cloudinaryHelpers");

// Helper function for Geocoding with Fallback logic
async function getCoordinates(listingData) {
    let baseLoc = `${listingData.location}, ${listingData.country}`;
    
    try {
        if (listingData.landmark) {
            let exactQuery = `${listingData.landmark}, ${baseLoc}`;
            let response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_KEY}&q=${encodeURIComponent(exactQuery)}&format=json`);
            let geoData = await response.json();
            
            if (geoData && geoData.length > 0 && geoData[0].lat) {
                return [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
            }
        }
        
        let response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_KEY}&q=${encodeURIComponent(baseLoc)}&format=json`);
        let geoData = await response.json();
        
        if (geoData && geoData.length > 0 && geoData[0].lat) {
            return [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
        }
    } catch (err) {
        console.log("Geocoding Error:", err);
    }
    
    return [78.9629, 20.5937]; 
}

async function geocodeQuery(query) {
    try {
        let response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_KEY}&q=${encodeURIComponent(query)}&format=json`);
        let geoData = await response.json();
        if (geoData && geoData.length > 0 && geoData[0].lat) {
            return [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
        }
    } catch (err) {
        console.log("Geocoding Error (search):", err);
    }
    return null;
}

// --- Sort & Price-range helpers (shared by index + search) ---

const VALID_SORTS = ["recommended", "price_asc", "price_desc", "rating_desc", "newest"];

function buildPriceFilter(req, baseFilter = {}) {
    const { minPrice, maxPrice } = req.query;
    const filter = { ...baseFilter };

    const min = minPrice !== undefined && minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : null;

    if ((min !== null && !isNaN(min)) || (max !== null && !isNaN(max))) {
        filter.price = {};
        if (min !== null && !isNaN(min)) filter.price.$gte = min;
        if (max !== null && !isNaN(max)) filter.price.$lte = max;
    }

    return filter;
}

function getSortStage(sort) {
    switch (sort) {
        case "price_asc": return { price: 1 };
        case "price_desc": return { price: -1 };
        case "newest": return { _id: -1 };
        // "rating_desc" is handled separately below since rating isn't a stored field
        default: return null; // "recommended" / unset -> natural/default order
    }
}

// Sorts an already-fetched array by average review rating, descending.
// Listings with no reviews sort last.
function sortByRating(listings) {
    return [...listings].sort((a, b) => {
        const avg = (l) => {
            if (!l.reviews || l.reviews.length === 0) return -1;
            const total = l.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            return total / l.reviews.length;
        };
        return avg(b) - avg(a);
    });
}
const PAGE_SIZE = 12;

module.exports.index = async (req, res) => {
  const { category } = req.query;
  const sort = VALID_SORTS.includes(req.query.sort) ? req.query.sort : "recommended";

  let filter = category ? { category: category } : {};
  filter = buildPriceFilter(req, filter);

  const CATEGORIES = require("../utils/categories");

  const totalCount = await Listing.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  let page = parseInt(req.query.page, 10);
  if (!page || page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const skip = (page - 1) * PAGE_SIZE;

  let allListings;
  if (sort === "rating_desc") {
      // Rating isn't stored, so we have to pull everything matching the filter,
      // compute averages, sort, THEN slice the page in memory.
      let fullSet = await Listing.find(filter).populate("reviews");
      fullSet = sortByRating(fullSet);
      allListings = fullSet.slice(skip, skip + PAGE_SIZE);
  } else {
      const sortStage = getSortStage(sort);
      let query = Listing.find(filter).skip(skip).limit(PAGE_SIZE);
      if (sortStage) query = query.sort(sortStage);
      allListings = await query;
  }

  let savedIds = [];
  if (req.user) {
    const SavedListing = require("../models/savedListing.js");
    const saved = await SavedListing.find({ user: req.user._id }).select("listing");
    savedIds = saved.map(s => s.listing.toString());
  }

 res.render("listings/index.ejs", {
      allListings,
      CATEGORIES,
      currentCategory: category || null,
      savedIds,
      currentSort: sort,
      minPrice: req.query.minPrice || "",
      maxPrice: req.query.maxPrice || "",
      currentPage: page,
      totalPages,
      totalCount,
      cardThumb,
  });
};

module.exports.searchListings = async (req, res) => {
    const { q } = req.query;
    const CATEGORIES = require("../utils/categories");
    const sort = VALID_SORTS.includes(req.query.sort) ? req.query.sort : "recommended";

    if (!q || !q.trim()) {
        return res.redirect("/listings");
    }

    const query = q.trim();
    const regex = new RegExp(query, "i");

    let textFilter = buildPriceFilter(req, {
        $or: [
            { title: regex },
            { location: regex },
            { landmark: regex },
            { country: regex },
        ]
    });

    const textMatches = await Listing.find(textFilter);

    let nearbyListings = [];
    let searchCenter = null;
    const coords = await geocodeQuery(query);
    if (coords) {
        searchCenter = coords;
        let nearFilter = buildPriceFilter(req, {
            geometry: {
                $near: {
                    $geometry: { type: "Point", coordinates: coords },
                    $maxDistance: 5000
                }
            }
        });
        nearbyListings = await Listing.find(nearFilter);
    }

    const seen = new Set();
    let allListings = [];
    for (const l of [...textMatches, ...nearbyListings]) {
        const idStr = l._id.toString();
        if (!seen.has(idStr)) {
            seen.add(idStr);
            allListings.push(l);
        }
    }

    // Apply sort to the merged in-memory result set
    if (sort === "price_asc") {
        allListings.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price_desc") {
        allListings.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === "newest") {
        allListings.sort((a, b) => b._id.toString().localeCompare(a._id.toString()));
    } else if (sort === "rating_desc") {
        const populated = await Listing.populate(allListings, { path: "reviews" });
        allListings = sortByRating(populated);
    }

    let savedIds = [];
    if (req.user) {
        const SavedListing = require("../models/savedListing.js");
        const saved = await SavedListing.find({ user: req.user._id }).select("listing");
        savedIds = saved.map(s => s.listing.toString());
    }

  // Search merges two queries first, so pagination is applied AFTER sort,
    // on the final in-memory array.
    const totalCount = allListings.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    let page = parseInt(req.query.page, 10);
    if (!page || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    const skip = (page - 1) * PAGE_SIZE;
    const pagedListings = allListings.slice(skip, skip + PAGE_SIZE);

 res.render("listings/index.ejs", {
        allListings: pagedListings,
        CATEGORIES,
        currentCategory: null,
        searchQuery: query,
        searchCenter,
        savedIds,
        currentSort: sort,
        minPrice: req.query.minPrice || "",
        maxPrice: req.query.maxPrice || "",
        currentPage: page,
        totalPages,
        totalCount,
        cardThumb,
    });
};

module.exports.myListings = async (req, res) => {
    const CATEGORIES = require("../utils/categories");
    const listings = await Listing.find({ owner: req.user._id });
    res.render("listings/my-listings.ejs", { listings, CATEGORIES, cardThumb });
};

module.exports.renderNewForm = (req, res) => {
  const CATEGORIES = require("../utils/categories");
  const { BILLING_PLANS, getPlansForCategories } = require("../utils/billingPlans");
  res.render("listings/new.ejs", { CATEGORIES, BILLING_PLANS, getPlansForCategories });
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

  const CATEGORIES = require("../utils/categories");

  let avgRating = 0;
  const reviewCount = listing.reviews.length;
  if (reviewCount > 0) {
    const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
    avgRating = (total / reviewCount).toFixed(1);
  }

  let isSaved = false;
  if (req.user) {
    const SavedListing = require("../models/savedListing.js");
    const existing = await SavedListing.findOne({ user: req.user._id, listing: listing._id });
    isSaved = !!existing;
  }

  const { BILLING_PLANS } = require("../utils/billingPlans");
res.render("listings/show.ejs", { listing, CATEGORIES, avgRating, reviewCount, isSaved, BILLING_PLANS, detailImage, smallThumb });
}

module.exports.createListing = async (req, res, next) => {
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listings"); 
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    const coords = await getCoordinates(req.body.listing);
    newListing.geometry = { type: "Point", coordinates: coords };

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

  let originalImageUrl = "";
  if (listing.image && listing.image.length > 0) {
      originalImageUrl = listing.image[0].url;
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }

  const CATEGORIES = require("../utils/categories");
  const { BILLING_PLANS } = require("../utils/billingPlans");
  res.render("listings/edit.ejs", { listing, originalImageUrl, CATEGORIES, BILLING_PLANS });
}

module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listings");
    }
    let { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.price = req.body.listing.price;
    listing.landmark = req.body.listing.landmark;
    listing.category = req.body.listing.category;
    listing.billingPlans = req.body.listing.billingPlans;
    listing.contactNumber = req.body.listing.contactNumber;
    listing.contactEmail = req.body.listing.contactEmail;

    const coords = await getCoordinates(req.body.listing);
    listing.geometry = { type: "Point", coordinates: coords };

    if (req.files && req.files.length > 0) {
        let newImages = req.files.map(f => ({ 
            url: f.path, 
            filename: f.filename 
        }));
        listing.image.push(...newImages);
    }

    await listing.save();

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
};