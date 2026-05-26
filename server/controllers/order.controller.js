const { validationResult } = require("express-validator");
const orderService = require("../services/order.service");
const ApiResponse  = require("../utils/ApiResponse");
const ApiError     = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, "Validation failed", errors.array());
};


const placeOrder = asyncHandler(async (req, res) => {
  validate(req);
  const order = await orderService.placeOrder(req.user._id, req.body);
  return new ApiResponse(201, "Order placed successfully.", order).send(res);
});


const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await orderService.getBuyerOrders(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return new ApiResponse(200, "Orders fetched.", result.orders, result.meta).send(res);
});


const getOrderById = asyncHandler(async (req, res) => {
  const Order = require("../models/Order.model");
  const order = await Order.findById(req.params.id)
    .populate("buyerId", "name email")
    .populate("items.product", "title images");
  if (!order) throw new ApiError(404, "Order not found.");


  if (
    req.user.role === "buyer" &&
    order.buyerId._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access denied.");
  }


  if (req.user.role === "seller") {
    const hasSellerItem = order.items.some(
      (item) => item.sellerId.toString() === req.user._id.toString()
    );
    if (!hasSellerItem) {
      throw new ApiError(403, "Access denied. This order does not contain your products.");
    }
  }

  return new ApiResponse(200, "Order fetched.", order).send(res);
});


const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!status) throw new ApiError(400, "Status is required.");

  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    req.user.role,
    note,
    req.user._id
  );
  return new ApiResponse(200, `Order status updated to "${status}".`, order).send(res);
});


const cancelOrder = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const order = await orderService.cancelOrder(req.params.id, req.user.role, note, req.user._id);
  return new ApiResponse(200, "Order cancelled.", order).send(res);
});

module.exports = { placeOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder };
