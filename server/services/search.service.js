const Fuse = require("fuse.js");
const Product = require("../models/Product.model");

const SEARCH_INTENT = {
  phone: {
    terms: ["phone", "mobile", "smartphone", "iphone", "ios phone", "android", "cellphone", "handset", "mobile accessories"],
    subcategories: ["Smartphones", "iPhones", "Android Phones", "Mobile Accessories"],
  },
  mobile: {
    terms: ["mobile", "phone", "smartphone", "iphone", "android", "wireless charger", "case", "screen guard"],
    subcategories: ["Smartphones", "iPhones", "Android Phones", "Mobile Accessories"],
  },
  iphone: {
    terms: ["iphone", "apple", "ios", "smartphone", "mobile", "phone"],
    subcategories: ["iPhones", "Smartphones"],
  },
  android: {
    terms: ["android", "google", "samsung", "smartphone", "mobile", "phone"],
    subcategories: ["Android Phones", "Smartphones"],
  },
  laptop: {
    terms: ["laptop", "gaming laptop", "ultrabook", "notebook", "portable computer", "workstation", "laptop accessories"],
    subcategories: ["Gaming Laptops", "Ultrabooks", "Laptops", "Gaming Accessories"],
  },
  shoes: {
    terms: ["shoes", "shoe", "sneakers", "running shoes", "fashion shoes", "trainers", "footwear", "kicks"],
    subcategories: ["Sneakers", "Shoes", "Streetwear"],
  },
  sneakers: {
    terms: ["sneakers", "shoes", "running shoes", "trainers", "footwear", "streetwear"],
    subcategories: ["Sneakers", "Shoes"],
  },
  smartwatch: {
    terms: ["smartwatch", "watch", "fitness tracker", "wearable", "bio wearable"],
    subcategories: ["Smartwatches", "Wearables"],
  },
  headphones: {
    terms: ["headphones", "headphone", "earbuds", "earphones", "audio", "headset", "noise cancelling"],
    subcategories: ["Headphones", "Earbuds", "Audio"],
  },
};

const tokenize = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const detectIntent = (query) => {
  const normalized = query.toLowerCase();
  return Object.entries(SEARCH_INTENT).filter(([key, intent]) => {
    return normalized.includes(key) || intent.terms.some((term) => normalized.includes(term));
  });
};

const expandQuery = (query) => {
  const intents = detectIntent(query);
  const expanded = new Set([query.toLowerCase(), ...tokenize(query)]);

  intents.forEach(([, intent]) => {
    intent.terms.forEach((term) => expanded.add(term));
    intent.subcategories.forEach((term) => expanded.add(term.toLowerCase()));
  });

  return Array.from(expanded);
};

const normalizeProduct = (product) => ({
  ...product,
  searchText: [
    product.title,
    product.description,
    product.subcategory,
    product.category?.name,
    product.sellerId?.storeName,
    ...(product.tags || []),
    ...(product.synonyms || []),
    ...(product.trendingTags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase(),
});

const boostScore = (result, queryTerms, intents) => {
  let score = result.score ?? 1;
  const item = result.item;
  const subcategory = (item.subcategory || "").toLowerCase();
  const category = (item.category?.name || "").toLowerCase();

  const exactTitle = queryTerms.some((term) => (item.title || "").toLowerCase().includes(term));
  if (exactTitle) score *= 0.58;

  const synonymHit = queryTerms.some((term) => (item.synonyms || []).some((syn) => syn.includes(term)));
  if (synonymHit) score *= 0.42;

  const tagHit = queryTerms.some((term) => (item.tags || []).some((tag) => tag.includes(term)));
  if (tagHit) score *= 0.62;

  intents.forEach(([, intent]) => {
    const subHit = intent.subcategories.some((sub) => subcategory.includes(sub.toLowerCase()));
    const catHit = intent.subcategories.some((sub) => category.includes(sub.toLowerCase()));
    if (subHit || catHit) score *= 0.36;
  });

  if ((item.trendingTags || []).includes("trending")) score *= 0.9;
  if ((item.averageRating || 0) >= 4.7) score *= 0.94;

  return score;
};

const fuzzySearch = async (query, { limit = 20, threshold = 0.46 } = {}) => {
  if (!query || query.trim().length === 0) return [];

  const queryTerms = expandQuery(query.trim());
  const intents = detectIntent(query.trim());
  const products = await Product.find({ isActive: true })
    .populate("category", "name slug")
    .populate("sellerId", "name storeName vendorLocation")
    .select("title description tags synonyms trendingTags subcategory price discountedPrice stock averageRating numReviews images vendorLocation category")
    .limit(700)
    .lean();

  const searchableProducts = products.map(normalizeProduct);
  const fuse = new Fuse(searchableProducts, {
    includeScore: true,
    threshold,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: "title", weight: 0.32 },
      { name: "synonyms", weight: 0.28 },
      { name: "tags", weight: 0.18 },
      { name: "subcategory", weight: 0.12 },
      { name: "category.name", weight: 0.06 },
      { name: "description", weight: 0.04 },
    ],
  });

  const expandedQuery = queryTerms.join(" ");
  const fuseMatches = fuse.search(expandedQuery);
  const directMatches = searchableProducts
    .filter((product) => queryTerms.some((term) => product.searchText.includes(term)))
    .map((item) => ({ item, score: 0.28 }));

  const merged = new Map();
  [...fuseMatches, ...directMatches].forEach((result) => {
    const id = result.item._id.toString();
    const nextScore = boostScore(result, queryTerms, intents);
    const current = merged.get(id);
    if (!current || nextScore < current._score) {
      const { searchText, ...item } = result.item;
      merged.set(id, { ...item, _score: nextScore });
    }
  });

  return Array.from(merged.values())
    .sort((a, b) => a._score - b._score)
    .slice(0, Number(limit));
};

module.exports = { fuzzySearch, expandQuery };
