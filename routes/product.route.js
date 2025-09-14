const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const { upload, uploadToCloudinary } = require("../helper/cloudinaryUploader");

router.post(
    "/create-product",
    upload.single("image"), // 👈 Single file
    async (req, res, next) => {
        try {
            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer, "product-images");
                req.body.image = result.secure_url; // 👈 Single URL
            }

            await ProductController.createProduct(req, res);
        } catch (err) {
            console.error("Error in /create-product:", err.message);
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Product image upload failed",
                details: err.message,
            });
        }
    }
);

router.get("/productlist", ProductController.productLists);
router.get("/product/:id", ProductController.product);

// Update product — single image
router.put(
    "/product-update/:id",
    upload.single("image"), // 👈 Single file
    async (req, res, next) => {
        try {
            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer, "product-images");
                req.body.image = result.secure_url; // 👈 Single URL
            }

            await ProductController.productUpdate(req, res);
        } catch (err) {
            console.error("Error in /product-update:", err.message);
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Product update failed",
                details: err.message,
            });
        }
    }
);

router.delete("/product-delete/:id", ProductController.deleteProduct);

module.exports = router;
