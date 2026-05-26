import { useCallback, useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  X,
  ChevronRight,
  Package,
  AlertCircle,
  Headphones,
  Shirt,
  Cpu,
  Home,
  Watch,
  Gem,
  LayoutGrid,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import { useDelayedLoader, LoaderWrapper } from "../lib/loadingUtils";


const CATEGORIES = [
  {
    name: "All",
    icon: LayoutGrid,
    image: "/category-photos/all.jpg",
  },
  {
    name: "Smartphones",
    icon: Cpu,
    image: "/category-photos/smartphones.jpg",
  },
  {
    name: "iPhones",
    icon: Cpu,
    image: "/category-photos/iphones.jpg",
  },
  {
    name: "Android Phones",
    icon: Cpu,
    image: "/category-photos/android-phones.jpg",
  },
  {
    name: "Gaming Laptops",
    icon: Cpu,
    image: "/category-photos/gaming-laptops.jpg",
  },
  {
    name: "Ultrabooks",
    icon: Cpu,
    image: "/category-photos/ultrabooks.jpg",
  },
  {
    name: "Sneakers",
    icon: Shirt,
    image: "/category-photos/sneakers.jpg",
  },
  {
    name: "Hoodies",
    icon: Shirt,
    image: "/category-photos/hoodies.jpg",
  },
  {
    name: "Streetwear",
    icon: Shirt,
    image: "/category-photos/streetwear.jpg",
  },
  {
    name: "Smartwatches",
    icon: Watch,
    image: "/category-photos/smartwatches.jpg",
  },
  {
    name: "Headphones",
    icon: Headphones,
    image: "/category-photos/headphones.jpg",
  },
  {
    name: "Gaming Accessories",
    icon: LayoutGrid,
    image: "/category-photos/gaming-accessories.jpg",
  },
  {
    name: "Fashion Accessories",
    icon: Gem,
    image: "/category-photos/fashion-accessories.jpg",
  },
  {
    name: "Backpacks",
    icon: Package,
    image: "/category-photos/backpacks.jpg",
  },
  {
    name: "AI Gadgets",
    icon: Sparkles,
    image: "/category-photos/ai-gadgets.jpg",
  },
  {
    name: "Home",
    icon: Home,
    image: "/category-photos/home.jpg",
  },
];

const SEARCH_SYNONYMS = {
  phone: ["phone", "mobile", "smartphone", "iphone", "android", "handset", "cellphone"],
  mobile: ["phone", "mobile", "smartphone", "iphone", "android", "accessories"],
  laptop: ["laptop", "notebook", "ultrabook", "gaming laptop", "computer", "workstation"],
  shoes: ["shoes", "sneakers", "running shoes", "fashion shoes", "trainers", "footwear"],
  smartwatch: ["watch", "smartwatch", "wearable", "fitness tracker"],
  headphones: ["headphones", "audio", "earbuds", "earphones", "headset"],
};

const expandSearchTerms = (query) => {
  const q = query.toLowerCase().trim();
  const matches = Object.entries(SEARCH_SYNONYMS)
    .filter(([key]) => q.includes(key))
    .flatMap(([, values]) => values);
  return [q, ...matches].filter(Boolean);
};

const CATEGORY_ALIASES = {
  Smartphones: ["smartphone", "smartphones", "phone", "mobile"],
  iPhones: ["iphone", "iphones", "ios", "apple"],
  "Android Phones": ["android", "android phone", "android phones"],
  "Gaming Laptops": ["gaming laptop", "laptop", "gaming"],
  Ultrabooks: ["ultrabook", "ultrabooks", "notebook"],
  Sneakers: ["sneaker", "sneakers", "shoes", "footwear"],
  Hoodies: ["hoodie", "hoodies", "sweatshirt"],
  Streetwear: ["streetwear", "techwear", "apparel"],
  Smartwatches: ["smartwatch", "smartwatches", "watch"],
  Headphones: ["headphones", "headphone", "audio", "earbuds"],
  "Gaming Accessories": ["gaming accessories", "keyboard", "mouse", "controller"],
  "Fashion Accessories": ["fashion accessories", "accessories", "briefcase", "sling"],
  Backpacks: ["backpack", "backpacks", "bag", "bags", "pack"],
  "AI Gadgets": ["ai", "gadget", "gadgets", "smart"],
  Home: ["home", "furniture", "desk", "chair", "workspace", "acoustic", "lighting"],
  Electronics: ["electronics", "smartphone", "phone", "laptop", "gaming laptop", "ultrabook", "gpu", "processor"],
  Wearables: ["wearables", "wearable", "ring", "watch", "glasses", "bio-ring"],
  Audio: ["audio", "headphones", "speakers", "earbuds", "monitor", "microphone"],
  Fashion: ["fashion", "hoodie", "sneakers", "streetwear", "technical", "shoes", "jacket"],
  Accessories: ["accessories", "accessory", "wallet", "bag", "backpack", "sling", "vault"],
  "Furniture & Home": ["furniture", "home", "desk", "chair", "workspace", "acoustic", "lighting"],
  "Home & Living": ["furniture", "home", "desk", "chair", "workspace", "acoustic", "lighting"],
  "Home & Kitchen": ["furniture", "home", "desk", "chair", "workspace", "acoustic", "lighting"],
  "Beauty & Health": ["beauty", "health", "skin", "care", "zirconia", "ring", "glasses", "bio-ring"],
  "Sports & Outdoors": ["sports", "outdoors", "fitness", "gear", "athletic", "runner", "runners", "sneakers"],
  "Books & Media": ["books", "media", "book", "vinyl", "collectible", "ledger", "secure", "command"],
};

const categoryTerms = (name) => CATEGORY_ALIASES[name] || [name.toLowerCase()];

const productText = (product) => {
  const category = typeof product.category === "object" ? product.category?.name : product.category;
  return [
    product.title,
    product.name,
    product.description,
    product.subcategory,
    category,
    ...(product.tags || []),
    ...(product.synonyms || []),
    ...(product.trendingTags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const FALLBACK_PRODUCTS = [
  {
    _id: "fp1",
    title: "Wireless Noise-Cancelling Headphones",
    price: 20749,
    originalPrice: 29049,
    category: "Audio",
    rating: 4.8,
    numReviews: 324,
    images: [
      { public_id: "fb_img1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" },
    ],
  },
  {
    _id: "fp2",
    title: "Premium Leather Crossbody Bag",
    price: 15769,
    originalPrice: 21579,
    category: "Fashion",
    rating: 4.6,
    numReviews: 187,
    images: [
      { public_id: "fb_img2", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80" },
    ],
  },
  {
    _id: "fp3",
    title: "Smart Fitness Tracker Pro",
    price: 10789,
    originalPrice: 14939,
    category: "Wearables",
    rating: 4.7,
    numReviews: 512,
    images: [
      { public_id: "fb_img3", url: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80" },
    ],
  },
];


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};


const SkeletonCard = () => (
  <div className="bg-card border border-[#412d15]/50 rounded-2xl overflow-hidden shadow-premium">
    <div className="aspect-[3/4] skeleton bg-[#1f150c]/60" />
    <div className="p-4 space-y-3 bg-[#1f150c]/20">
      <div className="h-3 w-16 skeleton rounded bg-[#1f150c]/40" />
      <div className="h-4 w-full skeleton rounded bg-[#1f150c]/40" />
      <div className="h-4 w-2/3 skeleton rounded bg-[#1f150c]/40" />
      <div className="h-3 w-24 skeleton rounded bg-[#1f150c]/40" />
      <div className="h-5 w-20 skeleton rounded bg-[#1f150c]/40" />
      <div className="h-9 w-full skeleton rounded-xl bg-[#1f150c]/40" />
    </div>
  </div>
);




const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const wishlistMode = searchParams.get("wishlist") === "true";


  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoader = useDelayedLoader(loading, { delay: 300, minimumShowTime: 500 });
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [renderedProducts, setRenderedProducts] = useState([]);


  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "All";
  const activeTag = searchParams.get("tag") || "";
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const isSearching = searchQuery.trim().length > 0;


  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = searchQuery
        ? `/products/search?q=${encodeURIComponent(searchQuery)}&limit=100&threshold=0.48`
        : "/products?limit=100";
      const { data } = await api.get(endpoint);
      const list = data?.products || data?.data || data || [];
      setAllProducts(list.length > 0 ? list : FALLBACK_PRODUCTS);
    } catch (err) {
      console.error("Failed to load products, backing up with default gallery.", err);
      setAllProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);


  const availableBrands = useMemo(() => {
    const brands = new Set();
    allProducts.forEach((p) => {
      const brand = p.sellerId?.storeName || p.sellerId?.name || "Generic Vendor";
      if (brand) brands.add(brand);
    });
    return Array.from(brands).sort();
  }, [allProducts]);

  const brandCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach((p) => {
      const brand = p.sellerId?.storeName || p.sellerId?.name || "Generic Vendor";
      counts[brand] = (counts[brand] || 0) + 1;
    });
    return counts;
  }, [allProducts]);


  const toggleBrand = (brand) => {
    const next = new Set(selectedBrands);
    if (next.has(brand)) {
      next.delete(brand);
    } else {
      next.add(brand);
    }
    setSelectedBrands(next);
  };


  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "All") params.delete("category");
    else params.set("category", cat);
    setSearchParams(params);
  };

  const setSearch = (q) => {
    const params = new URLSearchParams(searchParams);
    if (!q.trim()) params.delete("search");
    else params.set("search", q.trim());
    setSearchParams(params);
  };

  const clearTag = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("tag");
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams({});
    setMinPrice("");
    setMaxPrice("");
    setLocalSearch("");
    setSelectedBrands(new Set());
    setSelectedRating(0);
    setInStockOnly(false);
    setSortBy("featured");
  };


  const filtered = useMemo(() => {
    let results = [...allProducts];

    if (wishlistMode) {
      if (!isAuthenticated) {
        return [];
      }
      const wishlistIds = new Set(
        (user?.wishlist || []).map((entry) =>
          typeof entry === "string" ? entry : entry?._id?.toString?.()
        )
      );
      results = results.filter((p) => wishlistIds.has(p._id?.toString()));
    }


    if (activeCategory && activeCategory !== "All") {
      results = results.filter((p) => {
        const catName = typeof p.category === "object" ? p.category?.name : p.category;
        const haystack = [catName, p.subcategory, ...(p.tags || []), ...(p.synonyms || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return categoryTerms(activeCategory).some((term) => haystack.includes(term));
      });
    }


    if (searchQuery) {
      const terms = expandSearchTerms(searchQuery);
      results = results.filter((p) => {
        const haystack = productText(p);
        return terms.some((term) => haystack.includes(term));
      });
    }


    if (selectedBrands.size > 0) {
      results = results.filter((p) => {
        const brand = p.sellerId?.storeName || p.sellerId?.name || "Generic Vendor";
        return selectedBrands.has(brand);
      });
    }


    if (selectedRating > 0) {
      results = results.filter((p) => {
        const ratingVal = Number(p.averageRating || p.rating || 0);
        return ratingVal >= selectedRating;
      });
    }


    if (inStockOnly) {
      results = results.filter((p) => {
        const stockVal = p.stock !== undefined ? p.stock : 1;
        return stockVal > 0;
      });
    }


    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) results = results.filter((p) => p.price >= min);
    if (!isNaN(max)) results = results.filter((p) => p.price <= max);


    if (activeTag === "deal") {
      results = results.filter(
        (p) => (p.originalPrice && p.originalPrice > p.price) || (p.discountedPrice && p.discountedPrice > p.price)
      );
    }


    if (sortBy === "price-asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-desc") {
      results.sort((a, b) => {
        const rA = Number(a.averageRating || a.rating || 0);
        const rB = Number(b.averageRating || b.rating || 0);
        return rB - rA;
      });
    } else if (sortBy === "reviews-desc") {
      results.sort((a, b) => {
        const revA = Number(a.numReviews || a.reviews?.length || 0);
        const revB = Number(b.numReviews || b.reviews?.length || 0);
        return revB - revA;
      });
    }

    return results;
  }, [
    allProducts,
    activeCategory,
    searchQuery,
    selectedBrands,
    selectedRating,
    inStockOnly,
    minPrice,
    maxPrice,
    activeTag,
    sortBy,
    isAuthenticated,
    user,
    wishlistMode
  ]);


  useEffect(() => {
    if (!loading && !error) {
      setRenderedProducts(filtered);
    }
  }, [loading, error, filtered]);

  const hasActiveFilters =
    activeCategory !== "All" ||
    searchQuery ||
    activeTag ||
    minPrice ||
    maxPrice ||
    selectedBrands.size > 0 ||
    selectedRating > 0 ||
    inStockOnly ||
    sortBy !== "featured";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(localSearch);
  };

  const displayProducts = renderedProducts.length > 0 ? renderedProducts : filtered;
  const isInitialLoad = loading && displayProducts.length === 0;


  const SidebarContent = () => (
    <div className="space-y-8">

      {!isSearching && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setCategory(cat.name);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider
                              transition-all duration-200 text-left border
                              ${
                                isActive
                                  ? "bg-[#e1dcc9]/10 text-[#e1dcc9] border-[#e1dcc9]/25 shadow-glow-gold/10"
                                  : "text-muted-foreground border-transparent hover:bg-[#1f150c] hover:text-[#e1dcc9]"
                              }`}
                >
                  <cat.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{cat.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#e1dcc9]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}


      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
          Price Range
        </h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10 rounded-xl bg-card border-[#412d15] text-[#e1dcc9] text-xs font-black placeholder-[#e1dcc9]/30"
          />
          <span className="flex items-center text-muted-foreground text-xs font-bold">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10 rounded-xl bg-card border-[#412d15] text-[#e1dcc9] text-xs font-black placeholder-[#e1dcc9]/30"
          />
        </div>
      </div>


      {availableBrands.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
            Company / Brand
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-3 px-1 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer text-[#e1dcc9]/70 hover:text-[#e1dcc9] transition"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.has(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-[#412d15] bg-[#1f150c] text-[#e1dcc9] focus:ring-0 focus:ring-offset-0 h-4 w-4 accent-[#e1dcc9]"
                />
                <span className="flex-1">{brand}</span>
                <span className="text-[10px] font-black text-muted-foreground bg-[#1f150c]/85 px-2 py-0.5 rounded-full border border-[#412d15]/50">
                  {brandCounts[brand] || 0}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}


      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
          Customer Rating
        </h3>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => {
            const isSelected = selectedRating === stars;
            return (
              <button
                key={stars}
                onClick={() => setSelectedRating(isSelected ? 0 : stars)}
                className={`w-full flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition text-left border
                  ${isSelected
                    ? "bg-[#e1dcc9]/10 text-[#e1dcc9] border-[#e1dcc9]/25 shadow-glow-gold/10"
                    : "text-muted-foreground border-transparent hover:bg-[#1f150c] hover:text-[#e1dcc9]"}`}
              >
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < stars ? "fill-[#e1dcc9] text-[#e1dcc9]" : "text-[#1f150c] fill-[#1f150c]"}`}
                    />
                  ))}
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest">& Up</span>
              </button>
            );
          })}
        </div>
      </div>


      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
          Availability
        </h3>
        <label className="flex items-center justify-between px-1 py-1.5 text-xs font-black uppercase tracking-wider cursor-pointer text-[#e1dcc9]/70 hover:text-[#e1dcc9] transition">
          <span>In Stock Only</span>
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="sr-only peer"
              id="stock-toggle"
            />
            <div className="w-10 h-5.5 bg-[#1f150c] border border-[#412d15] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#e1dcc9] after:border-transparent after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#412d15] peer-checked:border-[#e1dcc9]/30"></div>
          </div>
        </label>
      </div>


      {hasActiveFilters && (
        <div className="border-t border-[#412d15]/55 pt-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
            Active Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeCategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#e1dcc9]/25 bg-[#e1dcc9]/10 text-[#e1dcc9] text-[10px] font-black uppercase tracking-wider">
                {activeCategory}
                <button onClick={() => setCategory("All")}>
                  <X className="w-3 h-3 text-[#e1dcc9]/70 hover:text-white" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#e1dcc9]/25 bg-[#e1dcc9]/10 text-[#e1dcc9] text-[10px] font-black uppercase tracking-wider">
                "{searchQuery}"
                <button onClick={() => setSearch("")}>
                  <X className="w-3 h-3 text-[#e1dcc9]/70 hover:text-white" />
                </button>
              </span>
            )}
            {selectedBrands.size > 0 && Array.from(selectedBrands).map((brand) => (
              <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#e1dcc9]/25 bg-[#e1dcc9]/10 text-[#e1dcc9] text-[10px] font-black uppercase tracking-wider">
                {brand}
                <button onClick={() => toggleBrand(brand)}>
                  <X className="w-3 h-3 text-[#e1dcc9]/70 hover:text-white" />
                </button>
              </span>
            ))}
            {selectedRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#e1dcc9]/25 bg-[#e1dcc9]/10 text-[#e1dcc9] text-[10px] font-black uppercase tracking-wider">
                {selectedRating}★ & Up
                <button onClick={() => setSelectedRating(0)}>
                  <X className="w-3 h-3 text-[#e1dcc9]/70 hover:text-white" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#e1dcc9]/25 bg-[#e1dcc9]/10 text-[#e1dcc9] text-[10px] font-black uppercase tracking-wider">
                In Stock
                <button onClick={() => setInStockOnly(false)}>
                  <X className="w-3 h-3 text-[#e1dcc9]/70 hover:text-white" />
                </button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#e1dcc9]/25 bg-[#e1dcc9]/10 text-[#e1dcc9] text-[10px] font-black uppercase tracking-wider">
                {activeTag}
                <button onClick={clearTag}>
                  <X className="w-3 h-3 text-[#e1dcc9]/70 hover:text-white" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-6 sm:pt-10 pb-16 bg-[#0a0502] min-h-screen text-[#e1dcc9]">
      <div className="container mx-auto px-4 md:px-6">

        <motion.div
          className="mb-10"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl font-black uppercase tracking-wider text-white"
              >
                {wishlistMode ? "My Wishlist" : isSearching ? "Search Results" : "Explore"}{" "}
                <span className="gradient-text">
                  {wishlistMode ? "Saved" : isSearching ? "Gallery" : "Catalog"}
                </span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="mt-2 text-muted-foreground text-sm font-medium tracking-wide"
              >
                {wishlistMode
                  ? isAuthenticated
                    ? `Showing ${displayProducts.length} saved boutique listings.`
                    : "Authenticate to view your saved wishlist products."
                  : `Discover ${displayProducts.length} high-fidelity products from premier global vendors.`}
              </motion.p>
            </div>

            <motion.div variants={fadeUp} custom={2} className="flex gap-3">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-2 border-[#412d15] text-[#e1dcc9] hover:bg-[#1f150c]"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
                className="gap-2 border-[#412d15] text-[#e1dcc9] hover:bg-[#1f150c]"
              >
                <RefreshCw className="w-4 h-4" />
                Synchronize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden gap-2 border-[#412d15] text-[#e1dcc9] hover:bg-[#1f150c]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Refine
              </Button>
            </motion.div>
          </div>


          <motion.form
            variants={fadeUp}
            custom={3}
            onSubmit={handleSearchSubmit}
            className="mt-6 relative max-w-xl"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search specifications, designers, category terms..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 pr-24 h-12 rounded-xl bg-card border-[#412d15] text-[#e1dcc9] text-sm focus:border-[#e1dcc9]/30 placeholder-[#e1dcc9]/30"
            />
            <Button
              type="submit"
              size="sm"
              variant="premium"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider"
            >
              Resolve
            </Button>
          </motion.form>


          {!isSearching && (
            <motion.div variants={fadeUp} custom={4} className="relative mt-7">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black to-transparent" />
              <div className="scrollbar-none flex gap-3 overflow-x-auto py-1 px-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`group relative h-28 min-w-32 overflow-hidden rounded-2xl border text-left transition duration-300 md:h-32 md:min-w-40 ${
                        isActive
                          ? "border-[#e1dcc9]/55 text-[#e1dcc9] shadow-glow-gold"
                          : "border-[#412d15] text-[#e1dcc9]/70 hover:border-[#e1dcc9]/30 hover:text-[#e1dcc9]"
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-110 group-hover:opacity-75"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                      <div
                        className={`absolute inset-0 transition duration-300 ${
                          isActive ? "bg-[#412d15]/25" : "bg-[#1f150c]/10 group-hover:bg-[#412d15]/15"
                        }`}
                      />
                      <div className="relative z-10 flex h-full flex-col justify-between p-3.5">
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#e1dcc9]/20 bg-black/45 text-[#e1dcc9] backdrop-blur-md transition group-hover:border-[#e1dcc9]/45">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="max-w-[7.5rem] text-[9px] font-black uppercase leading-snug tracking-[0.18em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                          {cat.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {wishlistMode && !isAuthenticated && (
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 mt-8 text-sm text-amber-100">
              <p>
                Authentication is required to synchronize wishlists. Please sign in to preserve your items.
              </p>
            </div>
          )}
        </motion.div>


        <div className="flex gap-8">

          <aside className="hidden md:block w-64 flex-shrink-0 border-r border-[#412d15]/30 pr-6">
            <div className="sticky top-28">
              <SidebarContent />
            </div>
          </aside>


          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 250 }}
                  className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0502] border-r border-[#412d15] p-6 z-50 md:hidden overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-black uppercase tracking-widest text-[#e1dcc9]">
                      Refinements
                    </h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#1f150c] text-[#e1dcc9] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <SidebarContent />
                </motion.div>
              </>
            )}
          </AnimatePresence>


          <main className="flex-1 min-w-0">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#412d15]/40">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#e1dcc9]">
                  {filtered.length} matching drop{filtered.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {searchQuery ? `Resolved for "${searchQuery}"` : `Catalogued in ${activeCategory}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3.5 rounded-xl bg-card border border-[#412d15] text-[#e1dcc9] text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-[#e1dcc9]/30 hover:border-[#e1dcc9]/20 transition cursor-pointer"
                >
                  <option value="featured">Featured Drops</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Top Customer Rated</option>
                  <option value="reviews-desc">Most Reviews</option>
                </select>
              </div>
            </div>


            {!loading && error && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest text-foreground mb-2">
                  System Desynchronized
                </h3>
                <p className="text-muted-foreground text-xs mb-6 max-w-sm">
                  {error}
                </p>
                <Button variant="outline" onClick={fetchProducts} className="gap-2 border-[#412d15] text-[#e1dcc9] hover:bg-[#1f150c]">
                  <RefreshCw className="w-4 h-4" />
                  Retry Sync
                </Button>
              </motion.div>
            )}


            {showLoader ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }, (_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <>

                {!loading && !error && displayProducts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10 py-6"
                  >
                    <div className="flex flex-col items-center justify-center text-center p-8 rounded-[32px] bg-[#1f150c] border border-[#412d15] shadow-2xl relative overflow-hidden max-w-xl mx-auto">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-primary/5 rounded-full blur-2xl" />
                      <div className="w-16 h-16 rounded-2xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center mx-auto mb-6">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-widest text-foreground mb-2 font-anton">
                        Zero Matches Registered
                      </h3>
                      <p className="text-muted-foreground text-xs mb-6 max-w-sm leading-relaxed">
                        {searchQuery
                          ? `No drops matched "${searchQuery}". Please refine specifications or select another category.`
                          : "Try adjusting active criteria to discover matching boutique inventory."}
                      </p>
                      <Button variant="outline" onClick={resetFilters} className="gap-2 border-[#412d15] text-[#e1dcc9] hover:bg-[#1f150c]">
                        <X className="w-4 h-4" />
                        Deactivate Filters
                      </Button>
                    </div>

                    <div className="border-t border-[#412d15]/40 pt-10">
                      <div className="mb-6">
                        <p className="text-[10px] font-bold text-[#e1dcc9]/50 tracking-[0.2em] uppercase mb-1">Top Tier Drops</p>
                        <h4 className="text-xl font-black text-white font-anton uppercase tracking-wide">
                          HIGHLY COVETED COLLECTION
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {FALLBACK_PRODUCTS.slice(0, 3).map((product, i) => (
                          <ProductCard key={product._id || i} product={product} index={i} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}


                {!error && displayProducts.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory + searchQuery + activeTag + Array.from(selectedBrands).join(",") + selectedRating + inStockOnly + sortBy}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    >
                      {displayProducts.map((product, i) => (
                        <ProductCard
                          key={product._id || `p_${i}`}
                          product={product}
                          index={i}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}


            {!loading && !error && displayProducts.length > 0 && (
              <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Showing {displayProducts.length} premium catalog drop
                {displayProducts.length !== 1 ? "s" : ""}
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
