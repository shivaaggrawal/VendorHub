const paymentService = require("../services/payment.service");
const ApiResponse    = require("../utils/ApiResponse");
const ApiError       = require("../utils/ApiError");
const asyncHandler   = require("../utils/asyncHandler");

// ── POST /api/payment/create-order ───────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw new ApiError(400, "Order ID is required.");

  const { razorpayOrder, payment } = await paymentService.createPaymentOrder(
    orderId,
    req.user._id
  );
  return new ApiResponse(201, "Payment order created.", {
    razorpayOrderId: razorpayOrder.id,
    amount:          razorpayOrder.amount,
    currency:        razorpayOrder.currency,
    keyId:           process.env.RAZORPAY_KEY_ID,
    paymentId:       payment._id,
  }).send(res);
});

// ── POST /api/payment/verify ──────────────────────────────────────────────
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "All Razorpay fields are required.");
  }

  const { payment, order } = await paymentService.verifyPayment(
    { razorpayOrderId, razorpayPaymentId, razorpaySignature },
    req.user._id
  );
  return new ApiResponse(200, "Payment verified successfully.", { payment, order }).send(res);
});

// ── POST /api/payment/:orderId/refund (admin) ─────────────────────────────
const refund = asyncHandler(async (req, res) => {
  const payment = await paymentService.processRefund(req.params.orderId, req.user.role);
  return new ApiResponse(200, "Refund processed successfully.", payment).send(res);
});

// ── GET /api/payment/payouts (seller) ─────────────────────────────────────
const getPayouts = asyncHandler(async (req, res) => {
  const payouts = await paymentService.getVendorPayouts(req.user._id);
  return new ApiResponse(200, "Payout history fetched.", payouts).send(res);
});

module.exports = { createOrder, verifyPayment, refund, getPayouts };
