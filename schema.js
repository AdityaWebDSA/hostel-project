const Joi = require('joi');
const CATEGORY_KEYS = require('./utils/categories').map(c => c.key);

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        landmark: Joi.string().allow("", null),
        contactNumber: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).allow("", null)
            .messages({ "string.pattern.base": "Contact number must be 7-15 digits (numbers, +, - and spaces allowed)" }),
        contactEmail: Joi.string().email({ tlds: { allow: false } }).allow("", null)
            .messages({ "string.email": "Please enter a valid email address" }),
        category: Joi.array().items(Joi.string().valid(...CATEGORY_KEYS)).min(1).required(),
        image: Joi.array().items(
            Joi.object({
                url: Joi.string().allow("", null),
                filename: Joi.string().allow("", null)
            })
        ).allow(null, ""),
    }).required(),

    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});