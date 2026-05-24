const Fuse = require("fuse.js");
const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");

/**
 * Builds a MongoDB filter query from request query params.
 * Supports: category, minPrice, maxPrice, minRating, vendorLocation, isActive
 */
const buildProductFilter = (query) => {
  const filter = { isActive: true };

  if (query.category)       filter.category       = query.category;
  if (query.vendorLocation) filter.vendorLocation  = new RegExp(query.vendorLocation, "i");
  if (query.minRating)      filter.averageRating   = { $gte: parseFloat(query.minRating) };

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  return filter;
};

/**
 * Returns paginated, sorted, filtered products.
 */
const getProducts = async (query) => {
  const {
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    order = "desc",
    search,
  } = query;

  const filter = buildProductFilter(query);

  // Text search (MongoDB text index)
  if (search) {
    filter.$text = { $search: search };
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const sort  = { [sortBy]: order === "asc" ? 1 : -1 };
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .populate("sellerId", "name storeName vendorLocation")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return {
    products,
    meta: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Returns a single product by ID and updates buyer's browsing history.
 */
const getProductById = async (productId, user = null) => {
  const product = await Product.findById(productId)
    .populate("category", "name slug")
    .populate("sellerId", "name storeName vendorLocation avatar")
    .populate("reviews.user", "name avatar");

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found.");
  }

  // Update browsing history asynchronously
  if (user) {
    user.addToBrowsingHistory(productId).catch(() => {});
  }

  return product;
};

/**
 * Creates a new product for a seller.
 */
const createProduct = async (data, sellerId, imageFiles = []) => {
  const { uploadMultipleToCloudinary } = require("./cloudinary.service");

  let images = [];
  if (imageFiles.length > 0) {
    images = await uploadMultipleToCloudinary(imageFiles, "marketplace/products");
  } else if (Array.isArray(data.images) && data.images.length > 0) {
    images = data.images;
  }

  const product = await Product.create({ ...data, sellerId, images });
  return product;
};

/**
 * Updates a product owned by the given seller.
 */
const updateProduct = async (productId, sellerId, updates, imageFiles = [], isAdmin = false) => {
  const product = await Product.findOne(isAdmin ? { _id: productId } : { _id: productId, sellerId });
  if (!product) throw new ApiError(404, "Product not found or unauthorized.");

  // Upload new images if provided
  if (imageFiles.length > 0) {
    const { uploadMultipleToCloudinary, deleteFromCloudinary } = require("./cloudinary.service");
    // Remove old images from Cloudinary
    for (const img of product.images) await deleteFromCloudinary(img.public_id);
    updates.images = await uploadMultipleToCloudinary(imageFiles, "marketplace/products");
  }

  Object.assign(product, updates);
  await product.save();
  return product;
};

/**
 * Soft-deletes a product (sets isActive=false).
 */
const deleteProduct = async (productId, sellerId, isAdmin = false) => {
  const query = isAdmin ? { _id: productId } : { _id: productId, sellerId };
  const product = await Product.findOne(query);
  if (!product) throw new ApiError(404, "Product not found or unauthorized.");

  product.isActive = false;
  await product.save();
};

/**
 * Adds/updates a review on a product (one review per user).
 */
const addReview = async (productId, userId, { rating, comment }) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found.");

  // Remove existing review from this user
  product.reviews = product.reviews.filter(
    (r) => r.user.toString() !== userId.toString()
  );
  product.reviews.push({ user: userId, rating, comment });
  product.updateRatingStats();
  await product.save();
  return product;
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  buildProductFilter,
};
