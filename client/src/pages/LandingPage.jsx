import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap,
  Mail,
  Headphones as HeadphonesIcon,
  Shirt,
  Cpu,
  Home,
  Watch,
  Gem,
  ShoppingBag,
  Heart,
  MapPin,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import { useDelayedLoader } from "../lib/loadingUtils";


const FALLBACK_PRODUCTS = [
  {
    _id: "f1",
    name: "SHADOW DRIP",
    price: 7400.00,
    originalPrice: 9900.00,
    category: "Fashion",
    rating: 4.9,
    numReviews: 412,
    description: "A sleek, minimalist hoodie with dark tones and subtle reflective accents for an effortless street vibe.",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
    ],
  },
  {
    _id: "f2",
    name: "URBAN PHANTOM",
    price: 7400.00,
    originalPrice: 9900.00,
    category: "Fashion",
    rating: 4.8,
    numReviews: 289,
    description: "Urban Phantom - A bold, oversized hoodie with edgy graphics and a stealthy aesthetic inspired by city nights.",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    ],
  },
  {
    _id: "f3",
    name: "NEON REBELLION",
    price: 7400.00,
    originalPrice: 9900.00,
    category: "Fashion",
    rating: 4.7,
    numReviews: 354,
    description: "A statement piece with vibrant neon details and rebellious street art influences for a standout look.",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    ],
  },
  {
    _id: "f4",
    name: "CYBERPUNK ANORAK",
    price: 14900.00,
    originalPrice: 19900.00,
    category: "Fashion",
    rating: 4.9,
    numReviews: 120,
    description: "Next-gen apparel integrating modular layers, technical pockets, and premium water-resistant textiles.",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    ],
  },
  {
    _id: "f5",
    name: "KINETIC RUNNERS",
    price: 17400.00,
    originalPrice: 24100.00,
    category: "Accessories",
    rating: 4.8,
    numReviews: 184,
    description: "Futuristic footwear constructed with breathable mesh grids and ultra-responsive kinetic sole units.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    ],
  },
  {
    _id: "f6",
    name: "CORE WATCHCAP",
    price: 2900.00,
    category: "Accessories",
    rating: 4.6,
    numReviews: 92,
    description: "Minimalist black knitted watchcap featuring custom stitched streetwear logo patch.",
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=600&q=80",
    ],
  },
];

const CATEGORIES = [
  {
    name: "Audio",
    count: 128,
    icon: HeadphonesIcon,
    image: "/category-photos/headphones.jpg",
  },
  {
    name: "Fashion",
    count: 256,
    icon: Shirt,
    image: "/category-photos/streetwear.jpg",
  },
  {
    name: "Electronics",
    count: 342,
    icon: Cpu,
    image: "/category-photos/ai-gadgets.jpg",
  },
  {
    name: "Home & Kitchen",
    count: 198,
    icon: Home,
    image: "/category-photos/home.jpg",
  },
  {
    name: "Wearables",
    count: 94,
    icon: Watch,
    image: "/category-photos/smartwatches.jpg",
  },
  {
    name: "Accessories",
    count: 175,
    icon: Gem,
    image: "/category-photos/fashion-accessories.jpg",
  },
];


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};


const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
    <div className="aspect-[3/4] skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-16 skeleton rounded" />
      <div className="h-4 w-full skeleton rounded" />
      <div className="h-4 w-2/3 skeleton rounded" />
      <div className="h-3 w-24 skeleton rounded" />
      <div className="h-5 w-20 skeleton rounded" />
      <div className="h-9 w-full skeleton rounded-xl" />
    </div>
  </div>
);


const HERO_SLIDES = [
  {
    number: "01",
    subtitle: "Limited Drops. Maximum Impact",
    heading: "LIMITED DROPS",
    description: "Exclusive weekly releases engineered for high-performance streetwear culture. Once they're gone, they're gone.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80",
  },
  {
    number: "02",
    subtitle: "Built for the Streets",
    heading: "STREET CULTURE",
    description: "Designed for the bold, the active, and the rebellious. Crafted with durable fabrics and relaxed oversized silhouettes.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=80",
  },
  {
    number: "03",
    subtitle: "Art Meets Attitude",
    heading: "ART & ATTITUDE",
    description: "Where contemporary fashion merges with urban expressionism and premium streetwear craftsmanship.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80",
  },
  {
    number: "04",
    subtitle: "Future-Ready Fashion",
    heading: "FUTURE TECHWEAR",
    description: "Next-gen apparel integrating modular layers, technical pockets, and premium water-resistant textiles.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&q=80",
  },
  {
    number: "05",
    subtitle: "Community-Driven Culture",
    heading: "COMMUNITY-DRIVEN CULTURE",
    description: "More than just a brand, we're a movement—connecting creatives, skaters, and trendsetters who define the streets.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=80",
  }
];




const tileArray = (arr, minItems = 12) => {
  if (!arr || arr.length === 0) return [];
  let tiled = [...arr];
  while (tiled.length < minItems) {
    tiled = [...tiled, ...arr];
  }
  return tiled;
};

const getProductImage = (item) => {
  const image = item?.images?.[0];
  if (!image) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80";
  return typeof image === "string" ? image : image.url;
};

const getProductTitle = (item) => item?.title || item?.name || "VendorHub Drop";




const LandingPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoader = useDelayedLoader(loading, { delay: 300, minimumShowTime: 500 });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeSlide, setActiveSlide] = useState(4);
  const [recs, setRecs] = useState({
    recommendedForYou: [],
    frequentlyBoughtTogether: [],
    similarProducts: [],
    trendingNearYou: [],
    inspiredByBrowsing: []
  });

  const [timerSettings, setTimerSettings] = useState({
    expiresAt: new Date(Date.now() + 80 * 60 * 60 * 1000).toISOString(),
    hours: 80,
  });
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const response = await api.get("/settings/timer");
        const data = response.data?.data;
        if (data?.expiresAt) {
          setTimerSettings(data);
          const diff = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
          setRemainingSeconds(diff);
        }
      } catch (err) {

        const diff = Math.max(0, Math.floor((new Date(timerSettings.expiresAt).getTime() - Date.now()) / 1000));
        setRemainingSeconds(diff);
      }
    };
    fetchTimer();
  }, []);

  useEffect(() => {
    if (timerSettings.expiresAt) {
      const diff = Math.max(0, Math.floor((new Date(timerSettings.expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
    }
  }, [timerSettings.expiresAt]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const timeParts = useMemo(() => {
    const seconds = remainingSeconds;
    const totalHours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: String(totalHours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(secs).padStart(2, "0"),
    };
  }, [remainingSeconds]);

  useEffect(() => {
    const fetchData = async () => {

      try {
        const { data } = await api.get("/products?limit=8");
        const list = data?.products || data?.data || data || [];
        setProducts(list.length > 0 ? list.slice(0, 8) : FALLBACK_PRODUCTS);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }


      try {
        const { data } = await api.get("/recommendations");
        const results = data?.data || data || {};
        setRecs({
          recommendedForYou: results.recommendedForYou || [],
          frequentlyBoughtTogether: results.frequentlyBoughtTogether || [],
          similarProducts: results.similarProducts || [],
          trendingNearYou: results.trendingNearYou || [],
          inspiredByBrowsing: results.inspiredByBrowsing || []
        });
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">

      <section className="container mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-8">
        <div className="relative w-full aspect-[16/10] md:aspect-[16/9] min-h-[480px] md:min-h-[640px] rounded-[32px] overflow-hidden border border-[#412d15]/50 shadow-2xl flex flex-col justify-between p-6 md:p-12 lg:p-16 select-none bg-black">


          {HERO_SLIDES.map((slide, index) => (
            <motion.div
              key={slide.number}
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <motion.img
                src={slide.image}
                alt={slide.heading}
                className="w-full h-full object-cover object-center"
                initial={{ scale: 1.01 }}
                animate={{ scale: index === activeSlide ? 1.08 : 1.01 }}
                transition={{ duration: 7, ease: "linear" }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/15" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
            </motion.div>
          ))}


          <div className="relative z-10" />


          <div className="relative z-10 max-w-3xl mt-auto mb-6 md:mb-10">
            <motion.div
              key={`content-${activeSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 md:space-y-6"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-7xl font-black tracking-tight text-white leading-none font-anton uppercase">
                {HERO_SLIDES[activeSlide].heading}
              </h1>

              <p className="text-sm md:text-base text-white/80 max-w-xl font-light leading-relaxed">
                {HERO_SLIDES[activeSlide].description}
              </p>

              <div>
                <button
                  onClick={() => navigate("/explore")}
                  className="flex items-center gap-3.5 bg-white text-black pl-6 pr-2 py-2 rounded-full font-bold hover:bg-neutral-100 transition-all duration-300 group shadow-lg"
                >
                  <span className="text-xs uppercase tracking-widest font-oswald font-semibold">Shop now</span>
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </motion.div>
          </div>


          <div className="relative z-10 border-t border-white/10 pt-5 md:pt-6">
            <div className="grid grid-cols-5 gap-3 md:gap-6">
              {HERO_SLIDES.map((slide, index) => {
                const isActive = index === activeSlide;
                return (
                  <button
                    key={slide.number}
                    onClick={() => setActiveSlide(index)}
                    className="flex flex-col text-left group outline-none cursor-pointer"
                  >

                    <div className="w-full h-[2.5px] bg-white/20 relative mb-3">
                      {isActive && (
                        <motion.div
                          layoutId="activeBar"
                          className="absolute inset-y-0 left-0 bg-white"
                          style={{ right: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </div>


                    <span className={`text-[10px] md:text-xs font-bold tracking-wider ${isActive ? 'text-white font-black' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>
                      {slide.number}
                    </span>
                    <span className={`text-[9px] md:text-xs font-light mt-1 hidden md:block ${isActive ? 'text-white/95 font-normal' : 'text-white/35 group-hover:text-white/55'} transition-colors truncate`}>
                      {slide.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      <section className="py-10 sm:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              Shop by <span className="gradient-text">Category</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-3 text-muted-foreground max-w-md mx-auto"
            >
              Browse curated collections across all your favourite categories
            </motion.p>
          </motion.div>

          <motion.div
            className="scrollbar-none flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} variants={fadeUp} custom={i} className="min-w-[18rem] lg:min-w-0">
                <Link
                  to={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex min-h-[17rem] overflow-hidden rounded-2xl border border-[#412d15] bg-[#1f150c]/45 p-5 text-left shadow-premium transition-all duration-300 hover:scale-[1.015] hover:border-[#e1dcc9]/35 hover:shadow-premium-hover lg:aspect-[4/3] lg:min-h-0"
                >
                  <img
                    src={cat.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/62 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1f150c]/45 via-transparent to-transparent" />
                  <div className="relative z-10 flex h-full min-h-full w-full flex-col justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#e1dcc9]/20 bg-black/45 text-[#e1dcc9] backdrop-blur-md transition group-hover:border-[#e1dcc9]/45 group-hover:bg-black/55">
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <div className="max-w-[13rem]">
                      <h3 className="font-anton text-2xl font-black uppercase leading-none tracking-[0.14em] text-[#e1dcc9] drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                        {cat.name}
                      </h3>
                      <p className="mt-2 text-xs font-bold text-white/85">
                        {cat.count} Products
                      </p>
                    </div>
                  </div>
                  <div className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-[#e1dcc9]/15 bg-black/35 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                    <ChevronRight className="w-3.5 h-3.5 text-[#e1dcc9]" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      <section className="py-10 sm:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <div className="max-w-2xl">
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-5xl font-black tracking-wider text-foreground font-anton uppercase"
              >
                NEW <span className="text-primary">DROPS</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed"
              >
                Stand out with our latest collection—bold designs, premium fabrics, and
                street-ready fits. Once they're gone, they're gone. Don't miss out!
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={2} className="shrink-0">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#e1dcc9] hover:underline underline-offset-4 font-oswald"
              >
                View All Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {showLoader ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {products.slice(0, 6).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}


          <div className="mt-12 text-center sm:hidden">
            <Button variant="outline" asChild className="rounded-full px-6">
              <Link to="/explore" className="gap-2 text-xs uppercase tracking-widest font-oswald">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      <section className="py-12 sm:py-16 bg-black/40 border-t border-b border-[#412d15]/30 relative overflow-hidden">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 mb-12">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#412d15]/50 border border-[#e1dcc9]/10 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>AI Smart Recommendations</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-anton uppercase">
              AI-POWERED <span className="text-primary">DISCOVERY HUB</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
              Explore hyper-personalised collections generated dynamically based on your browsing habits, category preferences, and location trends.
            </p>
          </div>
        </div>


        <div className="space-y-12">

          <div>
            <p className="text-[10px] font-bold text-[#e1dcc9]/70 tracking-widest uppercase mb-3 px-6 md:px-12 flex items-center gap-1.5 font-oswald">
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
              <span>Recommended For You</span>
            </p>
            <div className="marquee-group w-full overflow-hidden relative select-none">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

              <div className="flex w-max gap-6 py-2 animate-marquee">
                {tileArray(recs.recommendedForYou.length > 0 ? recs.recommendedForYou : products).map((item, idx) => (
                  <Link
                    key={`rfy-${item._id}-${idx}`}
                    to={`/product/${item._id}`}
                    className="w-64 shrink-0 p-3 rounded-2xl bg-[#1f150c]/85 border border-[#412d15]/50 hover:border-[#e1dcc9]/30 transition-all duration-300 group shadow-lg flex items-center gap-3.5"
                  >
                    <img
                      src={getProductImage(item)}
                      alt={getProductTitle(item)}
                      className="w-16 h-16 rounded-xl object-cover border border-[#412d15]"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-[#e1dcc9]/60 uppercase">{item.category?.name || item.category}</span>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5 group-hover:text-[#e1dcc9] transition-colors">{getProductTitle(item)}</p>
                      <p className="text-xs font-bold text-[#e1dcc9] mt-1">₹{Math.round(item.price).toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>


          <div>
            <p className="text-[10px] font-bold text-[#e1dcc9]/70 tracking-widest uppercase mb-3 px-6 md:px-12 flex items-center gap-1.5 font-oswald">
              <ShoppingBag className="w-3 h-3 text-primary animate-pulse" />
              <span>Frequently Bought Together</span>
            </p>
            <div className="marquee-group w-full overflow-hidden relative select-none">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

              <div className="flex w-max gap-6 py-2 animate-marquee" style={{ animationDirection: "reverse" }}>
                {tileArray(recs.frequentlyBoughtTogether.length > 0 ? recs.frequentlyBoughtTogether : products).map((item, idx) => (
                  <Link
                    key={`fbt-${item._id}-${idx}`}
                    to={`/product/${item._id}`}
                    className="w-64 shrink-0 p-3 rounded-2xl bg-[#1f150c]/85 border border-[#412d15]/50 hover:border-[#e1dcc9]/30 transition-all duration-300 group shadow-lg flex items-center gap-3.5"
                  >
                    <img
                      src={getProductImage(item)}
                      alt={getProductTitle(item)}
                      className="w-16 h-16 rounded-xl object-cover border border-[#412d15]"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-[#e1dcc9]/60 uppercase">{item.category?.name || item.category}</span>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5 group-hover:text-[#e1dcc9] transition-colors">{getProductTitle(item)}</p>
                      <p className="text-xs font-bold text-[#e1dcc9] mt-1">₹{Math.round(item.price).toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>


          <div>
            <p className="text-[10px] font-bold text-[#e1dcc9]/70 tracking-widest uppercase mb-3 px-6 md:px-12 flex items-center gap-1.5 font-oswald">
              <Heart className="w-3 h-3 text-red-400" />
              <span>Similar Products</span>
            </p>
            <div className="marquee-group w-full overflow-hidden relative select-none">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

              <div className="flex w-max gap-6 py-2 animate-marquee">
                {tileArray(recs.similarProducts.length > 0 ? recs.similarProducts : products).map((item, idx) => (
                  <Link
                    key={`sim-${item._id}-${idx}`}
                    to={`/product/${item._id}`}
                    className="w-64 shrink-0 p-3 rounded-2xl bg-[#1f150c]/85 border border-[#412d15]/50 hover:border-[#e1dcc9]/30 transition-all duration-300 group shadow-lg flex items-center gap-3.5"
                  >
                    <img
                      src={getProductImage(item)}
                      alt={getProductTitle(item)}
                      className="w-16 h-16 rounded-xl object-cover border border-[#412d15]"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-[#e1dcc9]/60 uppercase">{item.category?.name || item.category}</span>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5 group-hover:text-[#e1dcc9] transition-colors">{getProductTitle(item)}</p>
                      <p className="text-xs font-bold text-[#e1dcc9] mt-1">₹{Math.round(item.price).toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>


          <div>
            <p className="text-[10px] font-bold text-[#e1dcc9]/70 tracking-widest uppercase mb-3 px-6 md:px-12 flex items-center gap-1.5 font-oswald">
              <MapPin className="w-3 h-3 text-primary animate-pulse" />
              <span>Trending Near You</span>
            </p>
            <div className="marquee-group w-full overflow-hidden relative select-none">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

              <div className="flex w-max gap-6 py-2 animate-marquee" style={{ animationDirection: "reverse" }}>
                {tileArray(recs.trendingNearYou.length > 0 ? recs.trendingNearYou : products).map((item, idx) => (
                  <Link
                    key={`tny-${item._id}-${idx}`}
                    to={`/product/${item._id}`}
                    className="w-64 shrink-0 p-3 rounded-2xl bg-[#1f150c]/85 border border-[#412d15]/50 hover:border-[#e1dcc9]/30 transition-all duration-300 group shadow-lg flex items-center gap-3.5"
                  >
                    <img
                      src={getProductImage(item)}
                      alt={getProductTitle(item)}
                      className="w-16 h-16 rounded-xl object-cover border border-[#412d15]"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-[#e1dcc9]/60 uppercase">{item.category?.name || item.category}</span>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5 group-hover:text-[#e1dcc9] transition-colors">{getProductTitle(item)}</p>
                      <p className="text-xs font-bold text-[#e1dcc9] mt-1">₹{Math.round(item.price).toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>


          <div>
            <p className="text-[10px] font-bold text-[#e1dcc9]/70 tracking-widest uppercase mb-3 px-6 md:px-12 flex items-center gap-1.5 font-oswald">
              <Zap className="w-3 h-3 text-yellow-300" />
              <span>Inspired By Your Browsing</span>
            </p>
            <div className="marquee-group w-full overflow-hidden relative select-none">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

              <div className="flex w-max gap-6 py-2 animate-marquee">
                {tileArray(recs.inspiredByBrowsing.length > 0 ? recs.inspiredByBrowsing : products).map((item, idx) => (
                  <Link
                    key={`ibb-${item._id}-${idx}`}
                    to={`/product/${item._id}`}
                    className="w-64 shrink-0 p-3 rounded-2xl bg-[#1f150c]/85 border border-[#412d15]/50 hover:border-[#e1dcc9]/30 transition-all duration-300 group shadow-lg flex items-center gap-3.5"
                  >
                    <img
                      src={getProductImage(item)}
                      alt={getProductTitle(item)}
                      className="w-16 h-16 rounded-xl object-cover border border-[#412d15]"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-[#e1dcc9]/60 uppercase">{item.category?.name || item.category}</span>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5 group-hover:text-[#e1dcc9] transition-colors">{getProductTitle(item)}</p>
                      <p className="text-xs font-bold text-[#e1dcc9] mt-1">₹{Math.round(item.price).toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-primary/95 to-accent py-16 md:py-20">

          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col md:flex-row items-center justify-between gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <div className="text-center md:text-left">
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider mb-4"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Limited Time
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight"
                >
                  Flash Deals — Up to{" "}
                  <span className="text-yellow-300">60% Off</span>
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="mt-3 text-white/70 text-lg"
                >
                  Grab incredible offers before they disappear
                </motion.p>
              </div>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row items-center gap-4"
              >

                <div className="flex gap-2">
                  {[
                    { val: timeParts.hours, unit: "HRS" },
                    { val: timeParts.minutes, unit: "MIN" },
                    { val: timeParts.seconds, unit: "SEC" },
                  ].map((t) => (
                    <div
                      key={t.unit}
                      className="flex flex-col items-center bg-black/45 backdrop-blur-md rounded-2xl px-4.5 py-3.5 min-w-[65px] border border-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                    >
                      <span className="text-2xl font-black text-white font-mono leading-none tracking-tight">
                        {t.val}
                      </span>
                      <span className="text-[9px] font-bold text-[#e1dcc9]/70 uppercase tracking-widest mt-1.5">
                        {t.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="bg-white text-primary font-bold hover:bg-white/90 shadow-xl gap-2 hover:shadow-primary/20"
                  onClick={() => navigate("/explore?tag=deal")}
                >
                  Shop Deals
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>


      <section className="py-12 sm:py-16 relative overflow-hidden">

        <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6"
            >
              <Mail className="w-7 h-7 text-primary" />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              Join the{" "}
              <span className="gradient-text">VendorHub</span>{" "}
              Community
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-3 text-muted-foreground max-w-md mx-auto"
            >
              Get early access to deals, new arrivals, and exclusive
              member-only discounts delivered to your inbox.
            </motion.p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                <ShieldCheck className="w-5 h-5" />
                You're in! Check your inbox for a welcome gift.
              </motion.div>
            ) : (
              <motion.form
                variants={fadeUp}
                custom={3}
                onSubmit={handleSubscribe}
                className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 rounded-xl bg-card border-border"
                />
                <Button
                  type="submit"
                  variant="premium"
                  size="lg"
                  className="gap-2"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.form>
            )}

            <motion.p
              variants={fadeUp}
              custom={4}
              className="mt-4 text-xs text-muted-foreground"
            >
              No spam, ever. Unsubscribe anytime.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
