const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order   = require("../models/Order.model");
const Payment = require("../models/Payment.model");
const ApiError = require("../utils/ApiError");
const { PAYMENT_STATUS } = require("../constants/orderStatus");


const getCommissionRate = async () => {
  try {
    const Setting = require("../models/Setting.model");
    const s = await Setting.findOne({ key: "commissionRate" }).lean();
    if (s?.value?.rate !== undefined) return parseFloat(s.value.rate) / 100;
  } catch (_)
  return parseFloat(process.env.PLATFORM_COMMISSION_RATE || "10") / 100;
};







const createPaymentOrder = async (orderId, buyerId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");
  if (order.buyerId.toString() !== buyerId.toString()) {
    throw new ApiError(403, "Unauthorized.");
  }
  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw new ApiError(400, "Order is already paid.");
  }

  const isDummy = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_dummy");
  if (!isDummy && !process.env.RAZORPAY_KEY_ID?.startsWith("rzp_")) {
    throw new ApiError(
      503,
      "Payment gateway is not configured. Please set real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables."
    );
  }


  const amountInPaise = Math.round(order.totalAmount * 100);

  let razorpayOrder;

  if (isDummy) {

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


  const COMMISSION_RATE = await getCommissionRate();
  const commissionAmount = Math.round(order.totalAmount * COMMISSION_RATE * 100) / 100;
  const payment = await Payment.create({
    orderId,
    buyerId,
    amount:           amountInPaise,
    razorpayOrderId:  razorpayOrder.id,
    commissionRate:   COMMISSION_RATE * 100,
    commissionAmount,
  });


  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return { razorpayOrder, payment };
};






const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, buyerId) => {
  const isDummy = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_dummy");

  if (!isDummy) {

    const body      = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpaySignature) {
      throw new ApiError(400, "Payment verification failed. Invalid signature.");
    }
  }


  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) throw new ApiError(404, "Payment record not found.");

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status            = PAYMENT_STATUS.PAID;
  payment.payoutAmount      = payment.amount / 100 - payment.commissionAmount;
  await payment.save();


  const order = await Order.findById(payment.orderId);
  if (order) {
    order.paymentStatus      = PAYMENT_STATUS.PAID;
    order.razorpayPaymentId  = razorpayPaymentId;
    order.razorpaySignature  = razorpaySignature;
    await order.save();
  }

  return { payment, order };
};






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

    try {
      refundResult = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: payment.amount,
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


  await Order.findByIdAndUpdate(orderId, {
    refundStatus: "processed",
    refundAmount: payment.refundAmount,
    paymentStatus: PAYMENT_STATUS.REFUNDED,
  });

  return payment;
};






const getVendorPayouts = async (sellerId) => {
  const mongoose = require("mongoose");
  const sellerObjId = new mongoose.Types.ObjectId(sellerId);

  const payouts = await Payment.aggregate([

    { $match: { status: PAYMENT_STATUS.PAID } },

    {
      $lookup: {
        from:         "orders",
        localField:   "orderId",
        foreignField: "_id",
        as:           "order",
      },
    },
    { $unwind: "$order" },

    {
      $match: {
        "order.items.sellerId": sellerObjId,
      },
    },

    {
      $project: {
        amount:          1,
        commissionAmount:1,
        payoutAmount:    1,
        status:          1,
        createdAt:       1,
        "order.totalAmount": 1,
        "order.items":       1,
        "order.createdAt":   1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return payouts;
};

module.exports = { createPaymentOrder, verifyPayment, processRefund, getVendorPayouts };
