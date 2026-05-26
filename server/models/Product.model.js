const mongoose = require("mongoose");

const AI_TAG_DICTIONARY = {
  iphone: ["iphone", "apple", "smartphone", "mobile", "ios phone"],
  android: ["android", "smartphone", "mobile", "phone", "cellphone"],
  phone: ["phone", "smartphone", "mobile", "handset", "mobile accessories"],
  laptop: ["laptop", "notebook", "ultrabook", "gaming laptop", "computer"],
  sneaker: ["sneakers", "shoes", "running shoes", "fashion shoes", "footwear"],
  shoe: ["sneakers", "shoes", "running shoes", "fashion shoes", "footwear"],
  hoodie: ["hoodie", "streetwear", "apparel", "fashion", "techwear"],
  watch: ["smartwatch", "watch", "wearable", "fitness tracker"],
  headphone: ["headphones", "audio", "earbuds", "earphones", "headset"],
  backpack: ["backpack", "bag", "laptop bag", "travel pack"],
  gadget: ["ai gadget", "smart device", "future tech", "connected device"],
};

const toTerms = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2);

const uniqueLower = (values) =>
  [...new Set(values.filter(Boolean).map((value) => String(value).toLowerCase().trim()))];


const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);


const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: { type: String, trim: true, default: "" },


    images: [
      {
        public_id: { type: String, required: true },
        url:       { type: String, required: true },
      },
    ],


    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    reviews: [reviewSchema],


    averageRating: { type: Number, default: 0 },
    numReviews:    { type: Number, default: 0 },


    tags: [{ type: String, trim: true, lowercase: true }],


    synonyms: [{ type: String, trim: true, lowercase: true }],


    trendingTags: [{ type: String, trim: true, lowercase: true }],


    vendorLocation: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ synonyms: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ category: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });


productSchema.methods.updateRatingStats = function () {
  const count = this.reviews.length;
  if (count === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = Math.round((total / count) * 10) / 10;
    this.numReviews = count;
  }
};

productSchema.pre("validate", function (next) {
  const seedText = [this.title, this.subcategory, ...(this.tags || []), ...(this.synonyms || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const generated = [];
  Object.entries(AI_TAG_DICTIONARY).forEach(([trigger, terms]) => {
    if (seedText.includes(trigger)) generated.push(...terms);
  });

  this.tags = uniqueLower([...(this.tags || []), ...toTerms(this.title), this.subcategory, ...generated]);
  this.synonyms = uniqueLower([...(this.synonyms || []), ...generated]);

  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
