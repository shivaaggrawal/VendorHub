const mongoose = require("mongoose");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../constants/orderStatus");

// ─── Order item sub-schema ────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product:      { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title:        { type: String, required: true },       // snapshot at order time
    price:        { type: Number, required: true },        // snapshot at order time
    quantity:     { type: Number, required: true, min: 1 },
    image:        { type: String, default: "" },          // primary image url
    sellerId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

// ─── Shipping address sub-schema ──────────────────────────────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true },
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    phone:   { type: String, required: true },
  },
  { _id: false }
);

// ─── Main order schema ────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: { type: shippingAddressSchema, required: true },

    totalAmount: { type: Number, required: true, min: 0 },
    // Platform commission deducted from totalAmount
    commissionAmount: { type: Number, default: 0 },
    // Net payable to seller after commission
    sellerEarnings: { type: Number, default: 0 },

    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    // Razorpay references
    razorpayOrderId:   { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    // Status timeline
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String, default: "" },
      },
    ],

    // Cancellation
    cancelledBy:     { type: String, enum: ["buyer", "seller", "admin", ""], default: "" },
    cancellationNote:{ type: String, default: "" },

    // Refund tracking
    refundStatus: {
      type: String,
      enum: ["none", "requested", "processed"],
      default: "none",
    },
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ "items.sellerId": 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
