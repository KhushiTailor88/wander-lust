const Joi = require("joi");

// ✅ Define Listing schema
const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required()
  }).required()
});

// ✅ Export schema
module.exports = { listingSchema };
