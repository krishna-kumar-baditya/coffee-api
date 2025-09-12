// utils/validation/productValidation.js
const Joi = require("joi");

const productValidationSchema = Joi.object({
    name: Joi.string().max(100).required().messages({
        "string.max": "Name cannot exceed 100 characters",
        "any.required": "Name is required",
    }),

    description: Joi.string().max(1000).required().messages({
        "string.max": "Description cannot exceed 1000 characters",
        "any.required": "Description is required",
    }),

    price: Joi.number().positive().required().messages({
        "number.base": "Price must be a number",
        "number.positive": "Price must be greater than 0",
        "any.required": "Price is required",
    }),

    discountPrice: Joi.number()
        .min(0)
        .optional()
        .when("price", {
            is: Joi.number().required(),
            then: Joi.number().max(Joi.ref("price")),
        })
        .messages({
            "number.min": "Discount price cannot be negative",
            "number.max": "Discount price cannot exceed original price",
        }),

    stock: Joi.number().integer().min(0).required().messages({
        "number.base": "Stock must be a number",
        "number.integer": "Stock must be a whole number",
        "number.min": "Stock cannot be negative",
        "any.required": "Stock is required",
    }),

    weight: Joi.string().valid("250g", "500g", "1kg").required().messages({
        "any.only": "Weight must be 250g, 500g, or 1kg",
        "any.required": "Weight is required",
    }),

    type: Joi.string()
        .valid("bean", "ground", "kit", "spice", "merch", "gift")
        .required()
        .messages({
            "any.only":
                "Type must be one of: bean, ground, kit, spice, merch, gift",
            "any.required": "Type is required",
        }),

    brewGuide: Joi.string().allow("").optional(),

    origin: Joi.string().default("India").optional(),

    roastLevel: Joi.string()
        .valid("Light", "Medium", "Dark")
        .optional()
        .messages({
            "any.only": "Roast level must be Light, Medium, or Dark",
        }),

    // ✅ NEW: Allow 'images' field as an array of strings (Cloudinary URLs)
    images: Joi.array()
        .items(Joi.string().uri()) // Each item must be a valid URL
        .min(1) // At least one image required
        .required() // Make it required if you always expect images
        .messages({
            "array.base": "Images must be an array",
            "array.min": "At least one image is required",
            "string.uri": "Each image must be a valid URL",
        }),
}).options({ abortEarly: false }); // Keep this for full error reporting

module.exports = { productValidationSchema };
