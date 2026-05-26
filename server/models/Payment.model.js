const mongoose = require("mongoose");
const { PAYMENT_STATUS } = require("../constants/orderStatus");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },


    razorpayOrderId:   { type: String, required: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },


    refundId:     { type: String, default: "" },
    refundAmount: { type: Number, default: 0 },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "processed", "failed"],
      default: "none",
    },
    refundedAt: { type: Date, default: null },


    payoutStatus: {
      type: String,
      enum: ["pending", "processing", "paid"],
      default: "pending",
    },
    payoutAmount:  { type: Number, default: 0 },
    payoutDate:    { type: Date, default: null },
    payoutNote:    { type: String, default: "" },


    commissionRate:   { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ buyerId: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
