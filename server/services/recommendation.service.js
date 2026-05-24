const Product = require("../models/Product.model");
const Order   = require("../models/Order.model");

/**
 * AI Recommendation Engine
 * Separates products into 5 dynamically populated arrays:
 *  1. recommendedForYou (Personalized based on history/orders, fallback to top-rated)
 *  2. frequentlyBoughtTogether (Complementary items like accessories, bags, audio plugs)
 *  3. similarProducts (Similar to the last browsed item, fallback to similar of highest rated)
 *  4. trendingNearYou (Based on local trendingTags, rating velocities, and locations)
 *  5. inspiredByBrowsing (Browsing history tag match, fallback to editorial style-techwear items)
 *
 * @param {import("../models/User.model")} user - Optional authenticated user document
 * @param {number} [limit=12]
 * @returns {Promise<Object>} Redesigned structured recommendations object
 */
const getRecommendations = async (user, limit = 12) => {
  const excludedIds = new Set();
  const categoryWeights  = {};
  const tagWeights       = {};

  // Helper to fetch populated products
  const fetchProducts = async (query, sort = { averageRating: -1, createdAt: -1 }, sliceLimit = limit) => {
    return await Product.find(query)
      .populate("category", "name slug")
      .populate("sellerId", "name storeName storeDescription vendorLocation")
      .sort(sort)
      .limit(sliceLimit)
      .lean();
  };

  // 1. Extract signals if user is authenticated
  let hasSignals = false;
  let preferredCategories = [];
  let preferredTags = [];
  let lastBrowsedProductId = null;

  if (user) {
    // A. Browsing history signal
    if (user.browsingHistory && user.browsingHistory.length > 0) {
      hasSignals = true;
      const browsedIds = user.browsingHistory
        .map((h) => h.product)
        .filter((id) => id !== null && id !== undefined);

      browsedIds.forEach((id) => excludedIds.add(id.toString()));
      if (browsedIds[0]) {
        lastBrowsedProductId = browsedIds[0].toString();
      }

      const browsedProducts = await Product.find({ _id: { $in: browsedIds }, isActive: true })
        .select("category tags")
        .lean();

      browsedProducts.forEach((p, i) => {
        const weight = 1 / (i + 1); // decay
        const catKey = p.category?.toString();
        if (catKey) categoryWeights[catKey] = (categoryWeights[catKey] || 0) + weight * 2.0;
        (p.tags || []).forEach((tag) => {
          tagWeights[tag] = (tagWeights[tag] || 0) + weight;
        });
      });
    }

    // B. Past orders signal
    const pastOrders = await Order.find({ buyerId: user._id })
      .select("items")
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    const purchasedProductIds = [];
    pastOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product) {
          purchasedProductIds.push(item.product);
          excludedIds.add(item.product.toString());
        }
      });
    });

    if (purchasedProductIds.length > 0) {
      hasSignals = true;
      const purchasedProducts = await Product.find({
        _id: { $in: purchasedProductIds },
        isActive: true,
      })
        .select("category tags")
        .lean();

      purchasedProducts.forEach((p) => {
        const catKey = p.category?.toString();
        if (catKey) categoryWeights[catKey] = (categoryWeights[catKey] || 0) + 1.5;
        (p.tags || []).forEach((tag) => {
          tagWeights[tag] = (tagWeights[tag] || 0) + 0.5;
        });
      });
    }

    preferredCategories = Object.entries(categoryWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    preferredTags = Object.entries(tagWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  // ─── SEGMENT 1: Recommended For You ───────────────────────
  let recommendedForYou = [];
  if (hasSignals && (preferredCategories.length > 0 || preferredTags.length > 0)) {
    const query = {
      isActive: true,
      _id: { $nin: Array.from(excludedIds) },
      $or: [],
    };
    if (preferredCategories.length > 0) query.$or.push({ category: { $in: preferredCategories } });
    if (preferredTags.length > 0)       query.$or.push({ tags: { $in: preferredTags } });

    recommendedForYou = await fetchProducts(query, { averageRating: -1, createdAt: -1 }, limit);
  }

  // Fallback or padding
  if (recommendedForYou.length < 4) {
    const padCount = limit - recommendedForYou.length;
    const existingIds = recommendedForYou.map((p) => p._id.toString());
    const fallbackRecs = await fetchProducts(
      {
        isActive: true,
        _id: { $nin: [...Array.from(excludedIds), ...existingIds] },
      },
      { averageRating: -1, numReviews: -1 },
      padCount
    );
    recommendedForYou = [...recommendedForYou, ...fallbackRecs];
  }

  // ─── SEGMENT 2: Frequently Bought Together ────────────────
  // Upsell complementary accessories/wearables/essential pairs
  const complementaryTags = [
    "accessory", "wireless", "tws", "earbuds", "headphones",
    "mouse", "keyboard", "smart ring", "shoes", "sling", "bag"
  ];
  const fbtQuery = {
    isActive: true,
    _id: { $nin: Array.from(excludedIds) },
    $or: [
      { tags: { $in: complementaryTags } },
      { trendingTags: "trending" }
    ]
  };

  if (preferredTags.length > 0) {
    fbtQuery.$or.push({ tags: { $in: preferredTags } });
  }

  let frequentlyBoughtTogether = await fetchProducts(fbtQuery, { numReviews: -1, averageRating: -1 }, limit);

  if (frequentlyBoughtTogether.length < 4) {
    const existingIds = frequentlyBoughtTogether.map((p) => p._id.toString());
    const fallbackFBT = await fetchProducts(
      {
        isActive: true,
        _id: { $nin: [...Array.from(excludedIds), ...existingIds] },
      },
      { createdAt: -1 },
      limit - frequentlyBoughtTogether.length
    );
    frequentlyBoughtTogether = [...frequentlyBoughtTogether, ...fallbackFBT];
  }

  // ─── SEGMENT 3: Similar Products ──────────────────────────
  let similarProducts = [];
  if (lastBrowsedProductId) {
    similarProducts = await getSimilarProducts(lastBrowsedProductId, limit);
  } else {
    // Guest fallback: similar to the highest-rated product in the catalog
    const highestRated = await Product.findOne({ isActive: true }).sort({ averageRating: -1, numReviews: -1 }).lean();
    if (highestRated) {
      similarProducts = await getSimilarProducts(highestRated._id.toString(), limit);
    }
  }

  if (similarProducts.length < 4) {
    const existingIds = similarProducts.map((p) => p._id.toString());
    const fallbackSim = await fetchProducts(
      {
        isActive: true,
        _id: { $nin: [...Array.from(excludedIds), ...existingIds] },
      },
      { averageRating: -1 },
      limit - similarProducts.length
    );
    similarProducts = [...similarProducts, ...fallbackSim];
  }

  // ─── SEGMENT 4: Trending Near You ──────────────────────────
  const trendingQuery = {
    isActive: true,
    _id: { $nin: Array.from(excludedIds) }
  };

  // If user has default shipping address, prioritize products from sellers nearby or matching location
  let prioritizedLocation = null;
  if (user && user.addresses && user.addresses.length > 0) {
    const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    if (defaultAddr.country) prioritizedLocation = defaultAddr.country.toLowerCase();
  }

  let trendingNearYou = [];
  if (prioritizedLocation) {
    // Fetch sellers in this location first
    trendingNearYou = await fetchProducts(
      {
        ...trendingQuery,
        vendorLocation: new RegExp(prioritizedLocation, "i")
      },
      { averageRating: -1, numReviews: -1 },
      limit
    );
  }

  // Pad with global trending items
  if (trendingNearYou.length < 4) {
    const existingIds = trendingNearYou.map((p) => p._id.toString());
    const globalTrending = await fetchProducts(
      {
        ...trendingQuery,
        _id: { $nin: [...Array.from(excludedIds), ...existingIds] },
        trendingTags: { $in: ["trending", "cyberdrop", "featured"] }
      },
      { averageRating: -1, numReviews: -1 },
      limit - trendingNearYou.length
    );
    trendingNearYou = [...trendingNearYou, ...globalTrending];
  }

  // Ultimate fallback if still low
  if (trendingNearYou.length < 4) {
    const existingIds = trendingNearYou.map((p) => p._id.toString());
    const extraTrend = await fetchProducts(
      {
        isActive: true,
        _id: { $nin: [...Array.from(excludedIds), ...existingIds] }
      },
      { numReviews: -1, createdAt: -1 },
      limit - trendingNearYou.length
    );
    trendingNearYou = [...trendingNearYou, ...extraTrend];
  }

  // ─── SEGMENT 5: Inspired By Your Browsing ─────────────────
  let inspiredByBrowsing = [];
  if (hasSignals && (preferredCategories.length > 0 || preferredTags.length > 0)) {
    inspiredByBrowsing = await fetchProducts(
      {
        isActive: true,
        _id: { $nin: Array.from(excludedIds) },
        $or: [
          { category: { $in: preferredCategories } },
          { tags: { $in: preferredTags } }
        ]
      },
      { createdAt: -1 },
      limit
    );
  } else {
    // Guest fallback: Editorial techwear / high-fashion / modern cyberpunk aesthetic curation
    inspiredByBrowsing = await fetchProducts(
      {
        isActive: true,
        _id: { $nin: Array.from(excludedIds) },
        $or: [
          { tags: { $in: ["minimalist", "techwear", "cyberpunk", "luxury", "futuristic"] } },
          { synonyms: { $in: ["minimalist", "techwear", "cyberpunk", "luxury"] } }
        ]
      },
      { averageRating: -1 },
      limit
    );
  }

  if (inspiredByBrowsing.length < 4) {
    const existingIds = inspiredByBrowsing.map((p) => p._id.toString());
    const luxuryPadded = await fetchProducts(
      {
        isActive: true,
        _id: { $nin: [...Array.from(excludedIds), ...existingIds] }
      },
      { price: -1 }, // Show high-value inspirational luxury products
      limit - inspiredByBrowsing.length
    );
    inspiredByBrowsing = [...inspiredByBrowsing, ...luxuryPadded];
  }

  return {
    recommendedForYou,
    frequentlyBoughtTogether,
    similarProducts,
    trendingNearYou,
    inspiredByBrowsing
  };
};

/**
 * Returns "More like this" — products sharing category/tags with a given product.
 * @param {string} productId
 * @param {number} [limit=8]
 */
const getSimilarProducts = async (productId, limit = 8) => {
  const product = await Product.findById(productId).select("category tags").lean();
  if (!product) return [];

  const similar = await Product.find({
    isActive: true,
    _id:      { $ne: productId },
    $or: [
      { category: product.category },
      { tags:     { $in: product.tags || [] } },
    ],
  })
    .populate("category", "name slug")
    .populate("sellerId", "name storeName storeDescription vendorLocation")
    .sort({ averageRating: -1 })
    .limit(limit)
    .lean();

  return similar;
};

module.exports = { getRecommendations, getSimilarProducts };
