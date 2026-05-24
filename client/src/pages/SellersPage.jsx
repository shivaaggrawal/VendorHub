import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, MapPin, Package, ArrowRight, Loader2 } from "lucide-react";
import api from "../services/api";
import Loader from "../components/Loader";
import { LoaderWrapper } from "../lib/loadingUtils";

const fallbackSellers = [
  {
    storeName: "TechVault Pro",
    rating: 4.9,
    location: "Andheri, Mumbai",
    productCount: 86,
    banner:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  },
  {
    storeName: "Urban Style Co",
    rating: 4.7,
    location: "Bandra, Mumbai",
    productCount: 142,
    banner:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
  {
    storeName: "HomeNest Living",
    rating: 4.8,
    location: "Colaba, Mumbai",
    productCount: 63,
    banner:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  },
  {
    storeName: "FitGear Athletics",
    rating: 4.6,
    location: "Powai, Mumbai",
    productCount: 54,
    banner:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  },
  {
    storeName: "BookHaven",
    rating: 4.9,
    location: "Juhu, Mumbai",
    productCount: 218,
    banner:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
  },
  {
    storeName: "GlowUp Beauty",
    rating: 4.5,
    location: "Dadar, Mumbai",
    productCount: 97,
    banner:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
  },
];

const banners = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
];

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products?limit=100");
        const products = data.products || data || [];

        // Aggregate sellers from products
        const sellerMap = {};
        products.forEach((product) => {
          const seller = product.sellerId;
          if (!seller || !seller.storeName) return;
          const key = seller.storeName;
          if (!sellerMap[key]) {
            sellerMap[key] = {
              storeName: seller.storeName,
              location: seller.location || "Worldwide",
              rating: product.averageRating || 4.5,
              productCount: 0,
              ratingSum: 0,
              ratingCount: 0,
            };
          }
          sellerMap[key].productCount += 1;
          if (product.averageRating) {
            sellerMap[key].ratingSum += product.averageRating;
            sellerMap[key].ratingCount += 1;
          }
        });

        const aggregated = Object.values(sellerMap).map((s, idx) => ({
          ...s,
          rating: s.ratingCount > 0 ? s.ratingSum / s.ratingCount : s.rating,
          banner: banners[idx % banners.length],
        }));

        setSellers(aggregated.length > 0 ? aggregated : fallbackSellers);
      } catch {
        setSellers(fallbackSellers);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  return (
    <LoaderWrapper
      loading={loading}
      text="Scanning authorized platform nodes & credentials..."
      subtitle="VENDOR MATRIX DISCOVERY"
      fullScreen={false}
      minHeight="400px"
      preserveLayout={false}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-6 sm:pt-10 pb-16 bg-[#000000]"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[10px] font-bold text-[#e1dcc9] tracking-[0.25em] uppercase mb-4 bg-[#1f150c] border border-[#412d15] px-4 py-1.5 rounded-full shadow-glow-bronze">
            Verified Network Nodes
          </span>
          <h1 className="text-4xl md:text-6xl font-anton uppercase tracking-wider text-white mb-4">
            Top Vendor Hub <span className="gradient-text font-anton">Sellers</span>
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#e1dcc9]/40 to-transparent mx-auto mb-5" />
          <p className="text-white/60 text-sm md:text-base font-sans max-w-lg mx-auto leading-relaxed">
            Discover authorized vendors delivering premium drops and cyberpunk lifestyle products with exceptional service.
          </p>
        </motion.div>

        {/* Seller Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sellers.map((seller, idx) => (
            <motion.div
              key={seller.storeName}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <div
                onMouseMove={handleMouseMove}
                className="bg-[#1f150c] border border-[#412d15] rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 group relative spotlight-card"
              >
                {/* Banner */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={seller.banner}
                    alt={`${seller.storeName} banner`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.8] contrast-[1.1]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1f150c] via-[#1f150c]/40 to-transparent" />
                </div>

                {/* Avatar & Info */}
                <div className="relative px-6 pb-6 -mt-10 z-10">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-glow-bronze border-4 border-[#1f150c] mb-4">
                    <span className="text-[#e1dcc9] font-anton text-2xl uppercase">
                      {seller.storeName[0]}
                    </span>
                  </div>

                  {/* Store Name */}
                  <h3 className="text-2xl font-anton uppercase tracking-wider text-white mb-2 group-hover:text-[#e1dcc9] transition-colors duration-300">
                    {seller.storeName}
                  </h3>

                  {/* Rating & Location */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-[#e1dcc9]">
                      <Star className="w-4 h-4 fill-[#e1dcc9]" />
                      <span className="text-sm font-oswald tracking-wide font-bold">
                        {seller.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1.5 text-xs text-white/60 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-[#e1dcc9]/70" />
                      <span>{seller.location}</span>
                    </div>
                  </div>

                  {/* Product Count */}
                  <div className="flex items-center gap-2 text-xs text-white/60 font-sans mb-6">
                    <Package className="w-4 h-4 text-[#e1dcc9]/70" />
                    <span>{seller.productCount} products listed</span>
                  </div>

                  {/* Visit Store */}
                  <Link
                    to={`/explore?search=${encodeURIComponent(
                      seller.storeName
                    )}`}
                  >
                    <button className="w-full bg-transparent hover:bg-[#e1dcc9] text-[#e1dcc9] hover:text-black border border-[#e1dcc9]/40 hover:border-transparent transition-all duration-300 font-oswald uppercase tracking-[0.15em] text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                      Acquire Store Catalog
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
    </LoaderWrapper>
  );
};

export default SellersPage;
