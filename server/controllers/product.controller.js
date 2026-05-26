const { validationResult } = require("express-validator");
const productService = require("../services/product.service");
const { fuzzySearch } = require("../services/search.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError    = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, "Validation failed", errors.array());
};


const getAllProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.getProducts(req.query);
  return new ApiResponse(200, "Products fetched.", products, meta).send(res);
});


const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 20, threshold = 0.4 } = req.query;
  if (!q) throw new ApiError(400, "Query parameter 'q' is required.");

  const results = await fuzzySearch(q, { limit: parseInt(limit), threshold: parseFloat(threshold) });
  return new ApiResponse(200, `Found ${results.length} result(s).`, results).send(res);
});


const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id, req.user);
  return new ApiResponse(200, "Product fetched.", product).send(res);
});


const createProduct = asyncHandler(async (req, res) => {
  validate(req);
  const product = await productService.createProduct(
    req.body,
    req.user._id,
    req.files || []
  );
  return new ApiResponse(201, "Product created.", product).send(res);
});


const updateProduct = asyncHandler(async (req, res) => {
  validate(req);
  const product = await productService.updateProduct(
    req.params.id,
    req.user._id,
    req.body,
    req.files || [],
    req.user.role === "admin"
  );
  return new ApiResponse(200, "Product updated.", product).send(res);
});


const deleteProduct = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  await productService.deleteProduct(req.params.id, req.user._id, isAdmin);
  return new ApiResponse(200, "Product deleted.").send(res);
});


const addReview = asyncHandler(async (req, res) => {
  validate(req);
  const { rating, comment } = req.body;
  const product = await productService.addReview(req.params.id, req.user._id, { rating, comment });
  return new ApiResponse(201, "Review submitted.", {
    averageRating: product.averageRating,
    numReviews:    product.numReviews,
  }).send(res);
});

module.exports = {
  getAllProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
