const express = require("express");
const router  = express.Router();
const {
  getAllProducts, searchProducts, getProduct,
  createProduct, updateProduct, deleteProduct, addReview,
} = require("../controllers/product.controller");
const { verifyToken, optionalVerifyToken, checkRole } = require("../middleware/auth.middleware");
const { uploadMultiple }          = require("../middleware/upload.middleware");
const { uploadLimiter }           = require("../middleware/rateLimiter.middleware");
const {
  createProductValidator, updateProductValidator, reviewValidator,
} = require("../validators/product.validator");

// ── Public ────────────────────────────────────────────────────────────────
const { getAllCategories } = require("../controllers/admin.controller");

router.get("/",              getAllProducts);
router.get("/search",        searchProducts);
router.get("/categories",    getAllCategories);
router.get("/:id",           optionalVerifyToken, getProduct);

// ── Seller only ───────────────────────────────────────────────────────────
router.post(
  "/",
  verifyToken,
  checkRole(["seller"]),
  uploadLimiter,
  uploadMultiple,
  createProductValidator,
  createProduct
);

router.put(
  "/:id",
  verifyToken,
  checkRole(["seller", "admin"]),
  uploadLimiter,
  uploadMultiple,
  updateProductValidator,
  updateProduct
);

router.delete("/:id", verifyToken, checkRole(["seller", "admin"]), deleteProduct);

// ── Buyer — add review ────────────────────────────────────────────────────
router.post("/:id/reviews", verifyToken, checkRole(["buyer"]), reviewValidator, addReview);

module.exports = router;
