const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ROLES = require("../constants/roles");

const addressSchema = new mongoose.Schema(
  {
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true },
    country:  { type: String, default: "India" },
    isDefault:{ type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.BUYER,
    },

    isVendorApproved: {
      type: Boolean,
      default: false,
    },

    avatar: {
      public_id: { type: String, default: "" },
      url:       { type: String, default: "" },
    },

    addresses: [addressSchema],

    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],

    browsingHistory: [
      {
        product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        viewedAt:  { type: Date, default: Date.now },
      },
    ],

    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },


    storeName:        { type: String, default: "" },
    storeDescription: { type: String, default: "" },
    vendorLocation:   { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.addToBrowsingHistory = async function (productId) {

  this.browsingHistory = this.browsingHistory.filter(
    (h) => h.product.toString() !== productId.toString()
  );

  this.browsingHistory.unshift({ product: productId, viewedAt: new Date() });

  if (this.browsingHistory.length > 30) this.browsingHistory = this.browsingHistory.slice(0, 30);
  return this.save({ validateBeforeSave: false });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
