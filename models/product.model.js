const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPrice: {
            type: Number,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        // ✅ CHANGED: Single image URL (not array)
        image: {
            type: String,
            required: true, // Must have at least one image
            // match: [
            //     /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
            //     "Must be a valid URL",
            // ],
        },
        weight: {
            type: String,
            enum: ["250g", "500g", "1kg"],
            required: true,
        },
        type: {
            type: String,
            enum: ["bean", "ground", "kit", "spice", "merch", "gift"],
            required: true,
        },
        brewGuide: {
            type: String,
            default: "", // Markdown or link to brewing instructions
        },
        origin: {
            type: String,
            default: "India",
        },
        roastLevel: {
            type: String,
            enum: ["Light", "Medium", "Dark"],
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

ProductSchema.plugin(aggregatePaginate);

const ProductModel = mongoose.model("product", ProductSchema);
module.exports = ProductModel;