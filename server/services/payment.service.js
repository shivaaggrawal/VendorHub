const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order   = require("../models/Order.model");
const Payment = require("../models/Payment.model");
const ApiError = require("../utils/ApiError");
const { PAYMENT_STATUS } = require("../constants/orderStatus");

const COMMISSION_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE || "10") / 100;

/**
 * Creates a Razorpay order for a given marketplace order.
 * @param {string} orderId     - Marketplace Order._id
 * @param {string} buyerId     - Buyer User._id
 * @returns {{ razorpayOrder, payment }}
 */
const createPaymentOrder = async (orderId, buyerId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");
  if (order.buyerId.toString() !== buyerId.toString()) {
    throw new ApiError(403, "Unauthorized.");
  }
  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw new ApiError(400, "Order is already paid.");
  }

  // Razorpay expects amount in paise (INR * 100)
  const amountInPaise = Math.round(order.totalAmount * 100);

  let razorpayOrder;
  const isDummy = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_dummy");

  if (isDummy) {
    // Generate a mock Razorpay order for development/testing sandbox
    razorpayOrder = {
      id: `order_dummy_${Math.random().toString(36).substring(2, 15)}`,
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${orderId}`,
    };
  } else {
    razorpayOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: "INR",
      receipt:  `receipt_${orderId}`,
      notes:    { marketplaceOrderId: orderId.toString(), buyerId: buyerId.toString() },
    });
  }

  // Store payment record
  const commissionAmount = Math.round(order.totalAmount * COMMISSION_RATE * 100) / 100;
  const payment = await Payment.create({
    orderId,
    buyerId,
    amount:           amountInPaise,
    razorpayOrderId:  razorpayOrder.id,
    commissionRate:   COMMISSION_RATE * 100,
    commissionAmount,
  });

  // Link Razorpay order ID back to marketplace order
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return { razorpayOrder, payment };
};

/**
 * Verifies Razorpay payment signature and marks order as paid.
 * @param {{ razorpayOrderId, razorpayPaymentId, razorpaySignature }} data
 * @param {string} buyerId
 */
const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, buyerId) => {
  const isDummy = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_dummy");

  if (!isDummy) {
    // Step 1: Verify HMAC-SHA256 signature
    const body      = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpaySignature) {
      throw new ApiError(400, "Payment verification failed. Invalid signature.");
    }
  }

  // Step 2: Update Payment record
  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) throw new ApiError(404, "Payment record not found.");

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status            = PAYMENT_STATUS.PAID;
  payment.payoutAmount      = payment.amount / 100 - payment.commissionAmount;
  await payment.save();

  // Step 3: Update marketplace Order
  const order = await Order.findById(payment.orderId);
  if (order) {
    order.paymentStatus      = PAYMENT_STATUS.PAID;
    order.razorpayPaymentId  = razorpayPaymentId;
    order.razorpaySignature  = razorpaySignature;
    await order.save();
  }

  return { payment, order };
};

/**
 * Simulates a refund for a paid order (sandbox only).
 * @param {string} orderId
 * @param {string} requestedBy - "buyer" | "admin"
 */
const processRefund = async (orderId, requestedBy) => {
  const payment = await Payment.findOne({ orderId });
  if (!payment) throw new ApiError(404, "Payment not found.");
  if (payment.status !== PAYMENT_STATUS.PAID) {
    throw new ApiError(400, "Only paid orders can be refunded.");
  }
  if (payment.refundStatus === "processed") {
    throw new ApiError(400, "Refund has already been processed.");
  }

  const isDummy = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_dummy");
  let refundResult;

  if (isDummy) {
    refundResult = {
      id: `rfnd_dummy_${Math.random().toString(36).substring(2, 15)}`,
      amount: payment.amount,
    };
  } else {
    // Razorpay sandbox refund call
    try {
      refundResult = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: payment.amount, // full refund in paise
        notes:  { reason: `Refund requested by ${requestedBy}` },
      });
    } catch (err) {
      throw new ApiError(500, `Razorpay refund failed: ${err.message}`);
    }
  }

  payment.refundId     = refundResult.id;
  payment.refundAmount = refundResult.amount / 100;
  payment.refundStatus = "processed";
  payment.refundedAt   = new Date();
  payment.status       = PAYMENT_STATUS.REFUNDED;
  await payment.save();

  // Update order refund status
  await Order.findByIdAndUpdate(orderId, {
    refundStatus: "processed",
    refundAmount: payment.refundAmount,
    paymentStatus: PAYMENT_STATUS.REFUNDED,
  });

  return payment;
};

/**
 * Returns vendor payout history.
 * @param {string} sellerId
 */
const getVendorPayouts = async (sellerId) => {
  const payouts = await Payment.find({ status: PAYMENT_STATUS.PAID })
    .populate({
      path: "orderId",
      match: { "items.sellerId": sellerId },
      select: "totalAmount items createdAt",
    })
    .sort({ createdAt: -1 })
    .lean();

  // Filter out null populated orders (those not belonging to this seller)
  return payouts.filter((p) => p.orderId !== null);
};

module.exports = { createPaymentOrder, verifyPayment, processRefund, getVendorPayouts };
