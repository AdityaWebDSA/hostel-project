const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        // ✅ FIX 1: Add landmark to the Joi schema
        landmark: Joi.string().allow("", null), 
        
        // ✅ FIX 2: Ensure image is validated as an array
        image: Joi.array().items(
            Joi.object({
                url: Joi.string().allow("", null),
                filename: Joi.string().allow("", null)
            })
        ).allow(null)
    }).required()
});

// Review schema remains the same
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});