const Joi = require("joi"); 

// ✅ FIX 2: Added the missing listingSchema so validateListing actually works
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        landmark: Joi.string().allow("", null), // ✅ NEW: Added Landmark (Optional)
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null)
    }).required()
});
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});