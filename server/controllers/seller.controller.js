const Order   = require("../models/Order.model");
const Product = require("../models/Product.model");
const Payment = require("../models/Payment.model");
const ApiResponse  = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { PAYMENT_STATUS } = require("../constants/orderStatus");


const getDashboardSummary = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const earningsAgg = await Order.aggregate([
    { $match: { "items.sellerId": sellerId, paymentStatus: PAYMENT_STATUS.PAID } },
    { $group: { _id: null, totalEarnings: { $sum: "$sellerEarnings" } } },
  ]);

  const totalOrders   = await Order.countDocuments({ "items.sellerId": sellerId });
  const totalProducts = await Product.countDocuments({ sellerId, isActive: true });

  const lowStockProducts = await Product.find({ sellerId, isActive: true, stock: { $lte: 5 } })
    .select("title stock")
    .lean();

  return new ApiResponse(200, "Dashboard summary fetched.", {
    totalEarnings: earningsAgg[0]?.totalEarnings || 0,
    totalOrders,
    totalProducts,
    lowStockAlerts: lowStockProducts,
  }).send(res);
});


const getWeeklySales = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weekly = await Order.aggregate([
    {
      $match: {
        "items.sellerId": sellerId,
        createdAt:        { $gte: sevenDaysAgo },
        paymentStatus:    PAYMENT_STATUS.PAID,
      },
    },
    {
      $group: {
        _id:          { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        dailyEarnings: { $sum: "$sellerEarnings" },
        orders:        { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return new ApiResponse(200, "Weekly sales fetched.", weekly).send(res);
});


const getTopSellingProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const topProducts = await Order.aggregate([
    { $match: { "items.sellerId": sellerId, paymentStatus: PAYMENT_STATUS.PAID } },
    { $unwind: "$items" },
    { $match: { "items.sellerId": sellerId } },
    {
      $group: {
        _id:          "$items.product",
        title:        { $first: "$items.title" },
        totalSold:    { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  return new ApiResponse(200, "Top selling products fetched.", topProducts).send(res);
});


const getIncomingOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const orderService = require("../services/order.service");
  const result = await orderService.getSellerOrders(req.user._id, {
    page:  parseInt(page),
    limit: parseInt(limit),
    status,
  });
  return new ApiResponse(200, "Incoming orders fetched.", result.orders, result.meta).send(res);
});


const getMyProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Product.countDocuments({ sellerId: req.user._id });
  const products = await Product.find({ sellerId: req.user._id })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return new ApiResponse(200, "Products fetched.", products, {
    total,
    page:  parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / parseInt(limit)),
  }).send(res);
});

module.exports = {
  getDashboardSummary,
  getWeeklySales,
  getTopSellingProducts,
  getIncomingOrders,
  getMyProducts,
};
