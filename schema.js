const Joi = require('joi');
const CATEGORY_KEYS = require('./utils/categories').map(c => c.key);
const { PRICE_PLANS } = require('./utils/pricePlans');
const PRICE_PLAN_KEYS = PRICE_PLANS.map(p => p.key);

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(0).allow(null, ""),
        pricePlan: Joi.string().valid(...PRICE_PLAN_KEYS).allow("", null),
        landmark: Joi.string().allow("", null),
        contactNumber: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).allow("", null),
        contactEmail: Joi.string().email({ tlds: { allow: false } }).allow("", null),
        category: Joi.array().items(Joi.string().valid(...CATEGORY_KEYS)).min(1).required(),
        amenities: Joi.array().items(Joi.string()).allow(null),
        customAmenities: Joi.string().allow("", null),
        genderPolicy: Joi.string().valid("boys", "girls", "coed", "").allow(null),
        lat: Joi.number().allow(null, ""),
        lng: Joi.number().allow(null, ""),
        image: Joi.array().items(
            Joi.object({ url: Joi.string().allow("", null), filename: Joi.string().allow("", null) })
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