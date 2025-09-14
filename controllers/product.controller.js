const cloudinary = require("cloudinary").v2;
const { uploadToCloudinary } = require("../helper/cloudinaryUploader");
const ProductRepositories = require("../repositories/product.repositories");
const { productValidationSchema } = require("../validators/product.validator");
class ProductController {
    async createProduct(req, res) {
        try {
            const { error, value } = productValidationSchema.validate(
                req.body,
                { abortEarly: false }
            );
            if (error) {
                const messages = error.details.map((detail) => detail.message);
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: messages,
                });
            }

            const {
                name,
                description,
                price,
                discountPrice,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
            } = value;

            const { images } = req.body; // ✅ FIX: Get images from req.body
            if (!images || images.length === 0) {
                return res.status(400).json({ error: "No images provided" });
            }

            const prodObj = {
                name,
                description,
                price,
                discountPrice,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
                images, // Array of Cloudinary URLs
            };

            let savedData = await ProductRepositories.createProduct(prodObj);
            return res.status(201).json({
                success: true,
                status: 201,
                data: savedData,
                message: "Product added successfully",
            });
        } catch (error) {
            console.warn(`Error in createProduct: ${error?.message}`);
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Internal server error. Failed to create product.",
            });
        }
    }
    async productLists(req, res) {
        try {
            const { page = 1, limit = 5 } = req.query;
            let data = await ProductRepositories.productLists(page, limit);
            return res.status(200).json({
                success: true,
                status: 200,
                data: data || [],
                message:
                    data && data.length > 0
                        ? "Product lists fetched successfully"
                        : "No products found",
            });
        } catch (error) {
            console.log(
                `Error in Product Repositories of productLists ${error.message} `
            );
            return res.status(500).json({
                success: false,
                status: 500,
                message:
                    "Internal server error. Failed to fetch product lists.",
            });
        }
    }
    async product(req, res) {
        try {
            const { id } = req.params;
            const productData = await ProductRepositories.product(id);

            if (productData.isDeleted) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Product not found",
                });
            }

            return res.status(200).json({
                success: true,
                status: 200,
                data: productData,
                message: "Product fetched successfully",
            });
        } catch (error) {
            console.log(
                `Error in Product Repositories of product ${error.message} `
            );
            return res.status(500).json({
                success: false,
                status: 500,
                message:
                    "Internal server error. Failed to fetch product lists.",
            });
        }
    }
    async productUpdate(req, res) {
        try {
            const { id } = req.params;

            const existingProduct = await ProductRepositories.product(id);
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Product not found",
                });
            }

            console.log("Existing product images:", existingProduct.images);

            const { error, value } = productValidationSchema.validate(
                req.body,
                { abortEarly: false }
            );

            if (error) {
                const messages = error.details.map((detail) => detail.message);
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: messages,
                });
            }

            const {
                name,
                description,
                price,
                discountPrice,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
                inStock,
                isActive,
            } = value;

            let newImageUrls = existingProduct.images;

            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map((file) =>
                    uploadToCloudinary(file.buffer, "product-images")
                );
                const results = await Promise.all(uploadPromises);
                newImageUrls = results.map((r) => r.secure_url);

                // ✅ Delete old images
                const oldImageUrls = existingProduct.images || [];
                const deletionPromises = oldImageUrls.map(async (oldUrl) => {
                    try {
                        console.log("👉 Deleting old image:", oldUrl);

                        const publicId = oldUrl
                            .split("/image/upload/")
                            .pop()
                            .split("/")[2]
                            .split(".")[0];
                        console.log("🗑️ Destroying public_id:", publicId);

                        await cloudinary.uploader.destroy(publicId);
                        console.log("✅ Deleted from Cloudinary:", publicId);
                    } catch (err) {
                        console.error(
                            "❌ Failed to delete from Cloudinary:",
                            err.message
                        );
                    }
                });

                await Promise.allSettled(deletionPromises); // Non-blocking
            }

            const updatedProduct = {
                name,
                description,
                price,
                discountPrice,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
                images: newImageUrls,
                inStock,
                isActive,
            };

            const savedData = await ProductRepositories.updateProduct(
                id,
                updatedProduct
            );

            return res.status(200).json({
                success: true,
                status: 200,
                data: savedData,
                message: "Product updated successfully",
            });
        } catch (error) {
            console.error(
                `Error in ProductController.productUpdate: ${error.message}`
            );
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Internal server error. Failed to update product.",
            });
        }
    }

    // controllers/product.controller.js

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const productData = await ProductRepositories.product(id);
            if (!productData) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Product not found",
                });
            }

            // Perform soft delete
            const updatedProduct = await ProductRepositories.softDeleteProduct(
                id
            );

            return res.status(200).json({
                success: true,
                status: 200,
                data: updatedProduct,
                message: "Product deleted successfully (soft delete)",
            });
        } catch (error) {
            console.error(
                `Error in ProductController.deleteProduct: ${error.message}`
            );
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Internal server error. Failed to delete product.",
            });
        }
    }

    async restoreProduct(req, res) {
        try {
            const { id } = req.params;

            const productData = await ProductRepositories.product(id, true); // include deleted
            if (!productData) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Product not found",
                });
            }

            if (!productData.isDeleted) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: "Product is not deleted.",
                });
            }

            const restoredProduct = await ProductRepositories.restoreProduct(
                id
            );

            return res.status(200).json({
                success: true,
                status: 200,
                data: restoredProduct,
                message: "Product restored successfully",
            });
        } catch (error) {
            console.error(
                `Error in ProductController.restoreProduct: ${error.message}`
            );
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Internal server error. Failed to restore product.",
            });
        }
    }
}
module.exports = new ProductController();
