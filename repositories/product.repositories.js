const ProductModel = require("../models/product.model");
class ProductRepositories {
    async createProduct(data) {
        try {
            return await ProductModel.create(data);
        } catch (error) {
            console.log(
                `Error in Product Repositories of createProduct ${error.message} `
            );
            throw error;
        }
    }
    async productLists(page = 1, limit = 5) {
        try {
            const options = {
                page,
                limit,
            };

            const result = await ProductModel.aggregatePaginate(
                [
                    {
                        $match: {
                            isDeleted: false,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            description: 1,
                            price: 1,
                            discountPrice: 1,
                            category: 1,
                            stock: 1,
                            images: 1,
                            weight: 1,
                            type: 1,
                            brewGuide: 1,
                            origin: 1,
                            roastLevel: 1,
                        },
                    },
                ],
                options
            );
            console.log("result", result);
            return {
                total: result.totalDocs,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
                products: result.docs,
            };
        } catch (error) {
            console.log(
                `Error in Product Repositories of productLists ${error.message} `
            );
            throw error;
        }
    }
    async product(id) {
        try {
            return await ProductModel.findById(id);
        } catch (error) {
            console.log(
                `Error in Product Repositories of product ${error.message} `
            );
            throw error;
        }
    }
    // Example in ProductRepositories.js
    async updateProduct(id, updateData) {
        return await ProductModel.findByIdAndUpdate(id, updateData, {
            new: true,
        });
    }
    async softDeleteProduct(id) {
        return await ProductModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
    }

    async restoreProduct(id) {
        return await ProductModel.findByIdAndUpdate(
            id,
            { isDeleted: false },
            { new: true }
        );
    }
}
module.exports = new ProductRepositories();
