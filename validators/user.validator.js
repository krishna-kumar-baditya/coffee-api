const Joi = require("joi");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
const updateUserSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .optional()
        .messages({ "string.email": "Email must be a valid email address." }),

    firstName: Joi.string().min(2).max(10).optional().messages({
        "string.min": "Firstname must be at least 2 characters.",
        "string.max": "Firstname must not exceed 10 characters.",
    }),
    profilePic: Joi.string()
        .uri() // Ensures it's a valid URL (e.g., https://...)
        .optional()
        .messages({
            "string.uri": "Profile picture must be a valid URL.",
        }),

    lastName: Joi.string().min(2).max(10).optional().messages({
        "string.min": "Lastname must be at least 2 characters.",
        "string.max": "Lastname must not exceed 10 characters.",
    }),

    password: Joi.string()
        .pattern(passwordRegex)
        .message(
            "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
        )
        .optional(),

    age: Joi.number().integer().positive().optional(),
    role: Joi.string().valid("user", "admin").optional(),
})
    .or("email", "firstName", "lastName", "password", "age", "role")
    .messages({
        "object.missing": "At least one field must be provided for update.",
    });
module.exports = {
    updateUserSchema,
};
