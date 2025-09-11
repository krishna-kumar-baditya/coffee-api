const router = require("express").Router();
const ProductController = require("../controllers/product.controller");
const FileUploader = require("../helper/fileUpload");
const fileUpload = new FileUploader({
    folderName: "uploads/products",
    supportedFiles: ["image/png", "image/jpeg", "image/jpg"],
    fileSize: 1024 * 1024 * 5,
});

router.post(
    "/create-product",
    fileUpload.upload().array("images", 3),
    ProductController.createProduct
);
router.get("/productlist", ProductController.productLists);
router.get("/product/:id", ProductController.product);
router.put(
    "/product-update/:id",
    fileUpload.upload().array("images", 3),
    ProductController.productUpdate
);
router.delete("/product-delete/:id", ProductController.deleteProduct);
module.exports = router;
