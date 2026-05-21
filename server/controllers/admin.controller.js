const User     = require("../models/User.model");
const Product  = require("../models/Product.model");
const Order    = require("../models/Order.model");
const Category = require("../models/Category.model");
const Payment  = require("../models/Payment.model");
const ApiResponse  = require("../utils/ApiResponse");
const ApiError     = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const settingsService = require("../services/settings.service");
const { PAYMENT_STATUS } = require("../constants/orderStatus");

// ── GET /api/admin/analytics ──────────────────────────────────────────────
const getPlatformAnalytics = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalSellers,
    totalBuyers,
    totalProducts,
    totalOrders,
    revenueAgg,
    topVendors,
    topCategories,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "seller", isVendorApproved: true }),
    User.countDocuments({ role: "buyer" }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalCommission: { $sum: "$commissionAmount" } } },
    ]),
    // Top 5 vendors by earnings
    Order.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
      { $unwind: "$items" },
      { $group: { _id: "$items.sellerId", totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, orderCount: { $sum: 1 } } },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "seller" } },
      { $unwind: "$seller" },
      { $project: { totalSales: 1, orderCount: 1, "seller.name": 1, "seller.storeName": 1 } },
    ]),
    // Top 5 categories by product count
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", productCount: { $sum: 1 } } },
      { $sort: { productCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
      { $unwind: "$category" },
      { $project: { productCount: 1, "category.name": 1, "category.slug": 1 } },
    ]),
  ]);

  return new ApiResponse(200, "Platform analytics fetched.", {
    users:          { total: totalUsers, sellers: totalSellers, buyers: totalBuyers },
    totalProducts,
    totalOrders,
    revenue:        revenueAgg[0] || { totalRevenue: 0, totalCommission: 0 },
    topVendors,
    topCategories,
  }).send(res);
});

// ── GET /api/admin/vendors/pending ────────────────────────────────────────
const getPendingVendors = asyncHandler(async (_req, res) => {
  const vendors = await User.find({ role: "seller", isVendorApproved: false })
    .select("name email storeName vendorLocation createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return new ApiResponse(200, "Pending vendors fetched.", vendors).send(res);
});

// ── PATCH /api/admin/vendors/:id/approve ─────────────────────────────────
const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findOneAndUpdate(
    { _id: req.params.id, role: "seller" },
    { isVendorApproved: true },
    { new: true }
  ).select("-password");
  if (!vendor) throw new ApiError(404, "Vendor not found.");
  return new ApiResponse(200, "Vendor approved successfully.", vendor).send(res);
});

// ── PATCH /api/admin/vendors/:id/reject ──────────────────────────────────
const rejectVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findOneAndUpdate(
    { _id: req.params.id, role: "seller" },
    { isVendorApproved: false, isActive: false },
    { new: true }
  ).select("-password");
  if (!vendor) throw new ApiError(404, "Vendor not found.");
  return new ApiResponse(200, "Vendor rejected.", vendor).send(res);
});

// ── GET /api/admin/users ──────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const filter = role ? { role } : {};
  const skip   = (parseInt(page) - 1) * parseInt(limit);
  const total  = await User.countDocuments(filter);
  const users  = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  return new ApiResponse(200, "Users fetched.", users, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  }).send(res);
});

// ── PATCH /api/admin/users/:id/toggle-active ─────────────────────────────
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  user.isActive = !user.isActive;
  await user.save();
  return new ApiResponse(200, `User ${user.isActive ? "activated" : "deactivated"}.`, { isActive: user.isActive }).send(res);
});

// ── Category management ───────────────────────────────────────────────────
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return new ApiResponse(201, "Category created.", category).send(res);
});

const getAllCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  return new ApiResponse(200, "Categories fetched.", categories).send(res);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, "Category not found.");
  return new ApiResponse(200, "Category updated.", category).send(res);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found.");
  return new ApiResponse(200, "Category deleted.").send(res);
});

// ── GET /api/admin/orders ─────────────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { orderStatus: status } : {};
  const skip   = (parseInt(page) - 1) * parseInt(limit);
  const total  = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("buyerId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  return new ApiResponse(200, "All orders fetched.", orders, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  }).send(res);
});

// ── PATCH /api/admin/settings/commission ─────────────────────────────────
const updateCommissionSettings = asyncHandler(async (req, res) => {
  const { rate } = req.body;
  if (rate === undefined || rate < 0 || rate > 100) {
    throw new ApiError(400, "Commission rate must be between 0 and 100.");
  }
  process.env.PLATFORM_COMMISSION_RATE = String(rate);
  return new ApiResponse(200, `Commission rate updated to ${rate}%.`, { rate }).send(res);
});

// ── PATCH /api/admin/settings/timer ─────────────────────────────────────
const updateTimerSettings = asyncHandler(async (req, res) => {
  const { hours } = req.body;
  if (hours === undefined || hours === null) {
    throw new ApiError(400, "Timer hours are required.");
  }
  if (typeof hours !== "number") {
    throw new ApiError(400, "Timer hours must be a number.");
  }
  if (hours <= 0 || hours > 1000) {
    throw new ApiError(400, "Timer hours must be between 1 and 1000.");
  }

  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const setting = await settingsService.upsertSetting("countdown", {
    hours,
    expiresAt,
    updatedAt: new Date().toISOString(),
  });

  return new ApiResponse(200, "Countdown timer updated.", setting.value).send(res);
});

// ── POST /api/admin/orders/:id/refund ────────────────────────────────────
const adminRefund = asyncHandler(async (req, res) => {
  const paymentService = require("../services/payment.service");
  const payment = await paymentService.processRefund(req.params.id, "admin");
  return new ApiResponse(200, "Refund processed.", payment).send(res);
});

module.exports = {
  getPlatformAnalytics,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getAllUsers,
  toggleUserActive,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getAllOrders,
  updateCommissionSettings,
  updateTimerSettings,
  adminRefund,
};
