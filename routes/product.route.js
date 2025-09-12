const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const { upload, uploadToCloudinary } = require("../helper/cloudinaryUploader");

// Create product with multiple images
router.post(
    "/create-product",
    upload.array("images", 3),
    async (req, res, next) => {
        try {
            console.log(req.files.length);
            console.log(req.files.map((file) => file.buffer));

            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(async (file) => {
                    try {
                        const result = await uploadToCloudinary(
                            file.buffer,
                            "product-images"
                        );
                        console.log("result ", result);

                        return result.secure_url;
                    } catch (err) {
                        console.error(
                            `Failed to upload file ${file.originalname}:`,
                            err.message
                        );
                        throw new Error(
                            `Upload failed for ${file.originalname}`
                        );
                    }
                });
                console.log("uploadPromises ", uploadPromises);

                const secureUrls = await Promise.all(uploadPromises);
                console.log("secureUrls ", secureUrls);

                req.body.images = secureUrls; // Array of URLs
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

// Update product
router.put(
    "/product-update/:id",
    upload.array("images", 3),
    async (req, res, next) => {
        try {
            console.log(req.files.length);
            console.log(req.files.map((file) => file.buffer));

            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(async (file) => {
                    try {
                        const result = await uploadToCloudinary(
                            file.buffer,
                            "product-images"
                        );
                        console.log("result ", result);

                        return result.secure_url;
                    } catch (error) {
                        console.error(
                            `Failed to upload file ${file.originalname}:`,
                            err.message
                        );
                        throw new Error(
                            `Upload failed for ${file.originalname}`
                        );
                    }
                });
                console.log("uploadPromises ", uploadPromises);

                const secureUrls = await Promise.all(uploadPromises);
                console.log("secureUrls ", secureUrls);

                req.body.images = secureUrls; // Array of URLs
            }
            await ProductController.productUpdate(req, res);
        } catch (err) {
            return res.status(500).json({ message: "Product update failed" });
        }
    }
);

router.delete("/product-delete/:id", ProductController.deleteProduct);

module.exports = router;
