const express = require("express");
const {
  listProducts,
  getProduct,
  createProduct,
  uploadProductImage,
  uploadProductImages,
  updateProduct,
  archiveProduct,
  deleteProduct
} = require("../controllers/product.controller");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const {
  uploadProductImage: uploadProductImageMiddleware
} = require("../middlewares/uploadMiddleware");
const {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  productIdParamsSchema
} = require("../validators/product.validator");

const router = express.Router();

router.get("/", validate(listProductsSchema), listProducts);
router.post(
  "/upload-image",
  protect,
  authorize("admin"),
  uploadProductImageMiddleware.single("image"),
  uploadProductImage
);
router.post(
  "/upload-images",
  protect,
  authorize("admin"),
  uploadProductImageMiddleware.array("images", 6),
  uploadProductImages
);
router.post("/", protect, authorize("admin"), validate(createProductSchema), createProduct);
router.get("/:slugOrId", getProduct);
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateProductSchema),
  updateProduct
);
router.patch(
  "/:id/archive",
  protect,
  authorize("admin"),
  validate(productIdParamsSchema),
  archiveProduct
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(productIdParamsSchema),
  deleteProduct
);

module.exports = router;
