const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        landmark: Joi.string().allow("", null), 
        image: Joi.array().items(
            Joi.object({
                url: Joi.string().allow("", null),
                filename: Joi.string().allow("", null)
            })
        ).allow(null, ""), 
    }).required(),

    // ✅ ADD THIS LINE: This allows the array of filenames marked for deletion
    deleteImages: Joi.array() 
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});