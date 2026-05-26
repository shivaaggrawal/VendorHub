const mongoose = require("mongoose");


const cartItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price:    { type: Number, required: true },
  },
  { _id: true }
);


const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],

    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);


cartSchema.methods.recalculateTotal = function () {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
