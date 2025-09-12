const Joi = require("joi");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const signupSchema = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
        })
        .required()
        .messages({
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
        }),
    firstName: Joi.string().min(2).max(10).required().messages({
        "string.min": "Firstname must be at least 3 characters.",
        "string.max": "Firstname must cannot exceed 10 characters.",
        "any.required": "Firstname is required.",
    }),
    lastName: Joi.string().min(2).max(10).required().messages({
        "string.min": "Lastname must be at least 3 characters.",
        "string.max": "Lastname must cannot exceed 10 characters.",
        "any.required": "Lastname is required.",
    }),
    password: Joi.string()
        .pattern(passwordRegex)
        .message(
            "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
        )
        .required()
        .messages({
            "any.required": "Password is required.",
        }),
    age: Joi.number().integer().positive().optional(),
    role: Joi.string().valid("user", "admin").optional(),
    // ✅ NEW: Allow profilePic as optional URL
    profilePic: Joi.string()
        .uri() // Ensures it's a valid URL (e.g., https://...)
        .optional()
        .messages({
            "string.uri": "Profile picture must be a valid URL.",
        }),
}).options({ abortEarly: false });

const signinSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required()
        .messages({
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
        }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters.",
        "any.required": "Password is required.",
    }),
});
module.exports = {
    signupSchema,
    signinSchema,
};
