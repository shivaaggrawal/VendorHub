import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import {
  BarChart3,
  Grid3X3,
  Heart,
  Home,
  LogIn,
  LogOut,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import AISearchInput from "./AISearchInput";
import { logout } from "../redux/slices/authSlice";

const palettePanel = "bg-[#1f150c]/88 border-[#412d15]/70 backdrop-blur-2xl";

const desktopLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Explore", to: "/explore", icon: Sparkles },
  { label: "Categories", to: "/categories", icon: Grid3X3 },
  { label: "Sellers", to: "/sellers", icon: Store },
];

const drawerLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Explore", to: "/explore", icon: Sparkles },
  { label: "Categories", to: "/categories", icon: Grid3X3 },
  { label: "Orders", to: "/orders/latest/tracking", icon: PackageCheck, auth: true },
  { label: "Seller Dashboard", to: "/seller/dashboard", icon: Store, roles: ["seller"] },
  { label: "Admin Dashboard", to: "/admin/dashboard", icon: BarChart3, roles: ["admin"] },
  { label: "Profile", to: "/login", icon: User },
];

const bottomLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Explore", to: "/explore", icon: Sparkles },
  { label: "Cart", to: "/cart", icon: ShoppingBag, cart: true },
  { label: "Profile", to: "/login", icon: User },
];

const trendingSearches = [
  "iPhone 15 Pro",
  "gaming laptop",
  "android phone",
  "running shoes",
  "smartwatch",
  "AI gadgets",
];

const categorySuggestions = [
  "smartphones",
  "ultrabooks",
  "sneakers",
  "headphones",
  "backpacks",
  "streetwear",
];

const predictiveMap = {
  phone: ["smartphones", "iPhones", "Android phones", "mobile accessories"],
  mobile: ["smartphones", "Android phones", "iPhones", "wireless chargers"],
  laptop: ["gaming laptops", "ultrabooks", "notebooks", "laptop accessories"],
  shoes: ["sneakers", "running shoes", "fashion shoes", "streetwear footwear"],
  watch: ["smartwatches", "fitness trackers", "AI wearables"],
  audio: ["headphones", "earbuds", "studio speakers"],
};

const getPredictions = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matched = Object.entries(predictiveMap).find(([key]) => q.includes(key));
  const smart = matched?.[1] || [];

  return [
    query,
    ...smart,
    `${query} premium`,
    `${query} luxury edition`,
  ]
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .slice(0, 6);
};

const Logo = ({ compact = false }) => (
  <Link to="/" className="select-none text-center">
    <span
      className={`font-black tracking-[0.2em] text-[#e1dcc9] ${
        compact ? "text-base" : "text-xl"
      }`}
    >
      VENDOR<span className="font-light tracking-[0.08em]">HUB</span>
    </span>
  </Link>
);

const IconButton = ({ children, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="grid h-11 w-11 place-items-center rounded-full border border-[#e1dcc9]/12 bg-[#1f150c]/70 text-[#e1dcc9] shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition duration-300 hover:border-[#e1dcc9]/35 hover:bg-[#412d15]/70 active:scale-95"
  >
    {children}
  </button>
);

const SearchSheet = ({ open, onClose }) => {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("vendorhub_recent_searches");
      setRecent(saved ? JSON.parse(saved) : []);
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const predictions = useMemo(() => getPredictions(query), [query]);

  const runSearch = (term) => {
    const value = term.trim();
    if (!value) return;
    const updated = [value, ...recent.filter((item) => item !== value)].slice(0, 6);
    localStorage.setItem("vendorhub_recent_searches", JSON.stringify(updated));
    setRecent(updated);
    setQuery("");
    onClose();
    navigate(`/explore?search=${encodeURIComponent(value)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            className={`fixed left-3 right-3 top-3 z-[80] rounded-[2rem] border ${palettePanel} p-5 shadow-[0_28px_90px_rgba(0,0,0,0.72)] lg:hidden`}
            initial={{ opacity: 0, y: -34, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#e1dcc9]/50">
                  AI Smart Search
                </p>
                <h2 className="mt-1 text-xl font-black uppercase tracking-[0.08em] text-[#e1dcc9]">
                  Find The Drop
                </h2>
              </div>
              <IconButton label="Close search" onClick={onClose}>
                <X className="h-4 w-4" />
              </IconButton>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                runSearch(query);
              }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e1dcc9]/55" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search phone, laptop, shoes..."
                className="h-14 w-full rounded-full border border-[#412d15] bg-black/55 pl-11 pr-4 text-sm text-[#e1dcc9] outline-none transition focus:border-[#e1dcc9]/45 focus:shadow-[0_0_40px_rgba(225,220,201,0.08)]"
              />
            </form>

            <div className="mt-5 space-y-5">
              {query.trim() ? (
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#e1dcc9]/45">
                    Predictive Suggestions
                  </p>
                  <div className="space-y-2">
                    {predictions.map((term) => (
                      <button
                        key={term}
                        onClick={() => runSearch(term)}
                        className="flex w-full items-center justify-between rounded-2xl border border-[#412d15]/70 bg-black/25 px-4 py-3 text-left text-sm text-[#e1dcc9]/85 transition hover:border-[#e1dcc9]/25 hover:bg-[#412d15]/35"
                      >
                        <span>{term}</span>
                        <Sparkles className="h-4 w-4 text-[#e1dcc9]/50" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {recent.length > 0 && (
                    <SearchChipGroup title="Recent Searches" items={recent} onSelect={runSearch} />
                  )}
                  <SearchChipGroup title="Trending Searches" items={trendingSearches} onSelect={runSearch} />
                  <SearchChipGroup title="Category Intelligence" items={categorySuggestions} onSelect={runSearch} />
                </>
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
};

const SearchChipGroup = ({ title, items, onSelect }) => (
  <div>
    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#e1dcc9]/45">
      {title}
    </p>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className="rounded-full border border-[#412d15] bg-[#412d15]/28 px-3.5 py-2 text-xs font-semibold text-[#e1dcc9]/78 transition hover:border-[#e1dcc9]/30 hover:bg-[#412d15]/70 hover:text-[#e1dcc9]"
        >
          {item}
        </button>
      ))}
    </div>
  </div>
);

const MobileDrawer = ({ open, onClose, user, isAuthenticated, onLogout }) => {
  const location = useLocation();

  const visibleLinks = drawerLinks.filter((item) => {
    if (item.auth && !isAuthenticated) return false;
    if (item.roles?.length && !item.roles.includes(user?.role)) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={`fixed bottom-0 left-0 top-0 z-[80] w-[86vw] max-w-sm border-r ${palettePanel} px-5 py-6 shadow-[30px_0_80px_rgba(0,0,0,0.7)] lg:hidden`}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <IconButton label="Close menu" onClick={onClose}>
                <X className="h-4 w-4" />
              </IconButton>
            </div>

            <div className="mb-6 rounded-[1.6rem] border border-[#412d15]/70 bg-black/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#e1dcc9]/45">
                Signed in as
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-[#e1dcc9]">
                {isAuthenticated ? user?.name || "VendorHub Member" : "Guest Explorer"}
              </p>
            </div>

            <nav className="space-y-2">
              {visibleLinks.map(({ label, to, icon: Icon }) => {
                const active = location.pathname + location.search === to || location.pathname === to;
                const finalTo = label === "Profile" && isAuthenticated ? "/profile" : to;
                return (
                  <Link
                    key={label}
                    to={finalTo}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-[#e1dcc9]/35 bg-[#e1dcc9]/10 text-[#e1dcc9]"
                        : "border-transparent text-[#e1dcc9]/72 hover:border-[#412d15] hover:bg-[#412d15]/28 hover:text-[#e1dcc9]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-6 left-5 right-5">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#412d15] bg-black/30 px-4 py-3 text-sm font-bold text-[#e1dcc9]/80 transition hover:border-[#e1dcc9]/25 hover:text-[#e1dcc9]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e1dcc9]/25 bg-[#e1dcc9] px-4 py-3 text-sm font-black text-black transition hover:bg-[#e1dcc9]/90"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const FloatingBottomNav = ({ cartCount, animateCart }) => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-full border border-[#e1dcc9]/12 bg-[#1f150c]/72 px-3 py-2 shadow-[0_24px_70px_rgba(0,0,0,0.68)] backdrop-blur-2xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {bottomLinks.map(({ label, to, icon: Icon, cart }) => {
          const finalTo = label === "Profile" && isAuthenticated ? "/profile" : to;
          const active = location.pathname === finalTo;
          return (
            <Link
              key={label}
              to={finalTo}
              className={`relative flex flex-col items-center justify-center rounded-full px-2 py-2 text-[10px] font-bold transition ${
                active ? "bg-[#e1dcc9] text-black" : "text-[#e1dcc9]/65 hover:bg-[#412d15]/50 hover:text-[#e1dcc9]"
              } ${cart ? "cart-glow-target" : ""}`}
            >
              {cart ? (
                <motion.div
                  animate={animateCart ? {
                    scale: [1, 1.25, 0.9, 1.12, 1],
                    rotate: [0, -8, 8, -4, 0],
                    y: [0, -5, 2, -1, 0]
                  } : {}}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Icon className="mb-1 h-4 w-4" />
                </motion.div>
              ) : (
                <Icon className="mb-1 h-4 w-4" />
              )}
              <span>{label}</span>
              {cart && cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute right-4 top-1 grid h-4 min-w-4 place-items-center rounded-full border border-black/30 bg-[#e1dcc9] px-1 text-[9px] font-black text-black"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items || []);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const [animateCart, setAnimateCart] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 800);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => {});
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="lg:hidden">
          <div className="mx-4 mt-4 flex h-16 items-center justify-between gap-3 rounded-full border border-[#e1dcc9]/12 bg-[#1f150c]/72 px-4 shadow-[0_18px_58px_rgba(0,0,0,0.58)] backdrop-blur-2xl">
            <IconButton label="Open menu" onClick={() => setDrawerOpen(true)}>
              <Menu className="h-5 w-5" />
            </IconButton>
            <Logo compact />
            <IconButton label="Open search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        <div className={`hidden border-b lg:block ${palettePanel}`}>
          <div className="container mx-auto px-6">
            <div className="flex h-16 items-center justify-between gap-4">
              <Logo />
              <div className="flex-1 min-w-[280px] max-w-2xl">
                <AISearchInput />
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/cart"
                  className="relative grid h-10 w-10 place-items-center rounded-xl text-[#e1dcc9]/70 transition hover:bg-[#412d15]/45 hover:text-[#e1dcc9] cart-glow-target"
                >
                  <motion.div
                    animate={animateCart ? {
                      scale: [1, 1.25, 0.9, 1.12, 1],
                      rotate: [0, -8, 8, -4, 0],
                      y: [0, -5, 2, -1, 0]
                    } : {}}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </motion.div>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border border-[#1f150c] bg-[#e1dcc9] px-1 text-[10px] font-black text-black shadow-glow-sm"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    className="grid h-10 w-10 place-items-center rounded-xl text-[#e1dcc9]/70 transition hover:bg-[#412d15]/45 hover:text-[#e1dcc9]"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="ml-2 rounded-full border border-[#412d15] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e1dcc9]/80 transition hover:border-[#e1dcc9]/30 hover:text-[#e1dcc9]"
                  >
                    Logout
                  </button>
                ) : (
                  <Button asChild variant="premium" size="sm">
                    <Link to="/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex h-11 items-center justify-between border-t border-[#412d15]/55">
              <nav className="flex items-center gap-1">
                {desktopLinks.map(({ label, to, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={label}
                      to={to}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                        active
                          ? "bg-[#e1dcc9] text-black"
                          : "text-[#e1dcc9]/65 hover:bg-[#412d15]/35 hover:text-[#e1dcc9]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e1dcc9]/45">
                Curated AI commerce for premium vendors
              </p>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
      <FloatingBottomNav cartCount={cartCount} animateCart={animateCart} />
    </>
  );
};

export default Navbar;
