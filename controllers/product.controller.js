const FileDeleter = require("../helper/deletefile");
const ProductRepositories = require("../repositories/product.repositories");
const { productValidationSchema } = require("../validators/product.validator");
const fileDeleter = new FileDeleter("uploads/products");
class ProductController {
    async createProduct(req, res) {
        try {
            const { error, value } = productValidationSchema.validate(
                req.body,
                {
                    abortEarly: false,
                }
            );
            if (error) {
                const filenames = req.files.map((file) => file.filename);
                console.log("error filenames ", filenames);
                fileDeleter.deleteMultiple(filenames);

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
                category,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
            } = value;
            if (!req.files || req.files.length === 0) {
                const filenames = req.files.map((file) => file.filename);
                console.log("filenames ", filenames);

                fileDeleter.deleteMultiple(filenames);
                return res.status(400).json({ error: "No files uploaded" });
            }
            const filenames = req.files.map((file) => file.filename);
            console.log("filenames ", filenames);
            const prodObj = {
                name,
                description,
                price,
                discountPrice,
                category,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
                images: filenames,
            };
            let savedData = await ProductRepositories.createProduct(prodObj);
            return res.status(201).json({
                success: true,
                status: 201,
                data: savedData,
                message: "Product added successfully",
            });
        } catch (error) {
            const filenames = req.files.map((file) => file.filename);
            console.log("filenames ", filenames);

            fileDeleter.deleteMultiple(filenames);

            console.warn(
                `Error in Product Controller of create product : ${error?.message} `
            );

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Internal server error. Failed to create product.",
            });
        }
    }
    async productLists(req, res) {
        try {
            const {page = 1,limit=5} = req.query
            let data = await ProductRepositories.productLists(page,limit);
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

            const productData = await ProductRepositories.product(id);
            if (!productData) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Product not found",
                });
            }

            console.log("req.body:", req.body); // 🔍 Debug: Check what's coming
            console.log("req.files:", req.files); // 🔍 Debug: Check uploaded files

            const { error, value } = productValidationSchema.validate(
                req.body,
                {
                    abortEarly: false,
                }
            );

            if (error) {
                const messages = error.details.map((detail) => detail.message);

                // Clean up uploaded files only if present
                if (req.files && req.files.length > 0) {
                    const filenames = req.files.map((file) => file.filename);
                    console.log("Deleting invalid upload files:", filenames);
                    fileDeleter.deleteMultiple(filenames);
                }

                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: messages,
                });
                // ✅ Function stops here due to `return`
            }

            // ✅ SAFE TO DESTRUCTURE NOW — validation passed
            const {
                name,
                description,
                price,
                discountPrice,
                category,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
            } = value;

            // Validate file upload
            if (!req.files || req.files.length === 0) {
                if (req.files && req.files.length === 0) {
                    const filenames = req.files.map((file) => file.filename);
                    fileDeleter.deleteMultiple(filenames);
                }
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: "At least one image is required.",
                });
            }

            const filenames = req.files.map((file) => file.filename);
            console.log("New image filenames:", filenames);

            const updatedProduct = {
                name,
                description,
                price,
                discountPrice,
                category,
                stock,
                weight,
                type,
                brewGuide,
                origin,
                roastLevel,
                images: filenames,
            };

            const savedData = await ProductRepositories.updateProduct(
                id,
                updatedProduct
            );

            // // Delete old images from server
            // const oldImages = productData.images || [];
            // fileDeleter.deleteMultiple(oldImages);

            return res.status(200).json({
                success: true,
                status: 200,
                data: savedData,
                message: "Product updated successfully",
            });
        } catch (error) {
            // 🔁 Safely handle any unexpected error
            if (req.files && req.files.length > 0) {
                const filenames = req.files.map((file) => file.filename);
                fileDeleter.deleteMultiple(filenames);
            }

            console.error(
                `Error in ProductController.productUpdate: ${error.message}`
            );
            // console.error("Stack:", error.stack);

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
