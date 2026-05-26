import { useMemo, useState, useEffect, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, ShoppingBag, Star, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { updateWishlist } from "../redux/slices/authSlice";
import api from "../services/api";
import { Button } from "./ui/button";
import { SmartImage } from "../lib/loadingUtils";

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80";

const getImageUrl = (image) => {
  if (!image) return fallbackImage;
  if (typeof image === "string") return image;
  return image.url || fallbackImage;
};

const normalizeProduct = (product = {}) => {
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || product.discountedPrice || 0);
  const category = product.category?.name || product.category || product.subcategory || "VendorHub";

  return {
    ...product,
    _id: product._id || product.id || "preview",
    title: product.title || product.name || "Premium Product",
    description: product.description || "A premium VendorHub drop crafted with cinematic detail.",
    price,
    originalPrice: originalPrice > price ? originalPrice : 0,
    rating: Number(product.averageRating || product.rating || 4.8),
    numReviews: Number(product.numReviews || product.reviews?.length || 0),
    category,
    image: getImageUrl(product.images?.[0]),
  };
};

const ProductCard = memo(({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const item = useMemo(() => normalizeProduct(product), [product]);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discount = useMemo(
    () => item.originalPrice
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0,
    [item.originalPrice, item.price]
  );

  useEffect(() => {
    const wishlistIds = new Set(
      (user?.wishlist || []).map((entry) =>
        typeof entry === "string" ? entry : entry?._id?.toString()
      )
    );
    setIsWishlisted(wishlistIds.has(item._id?.toString()));
  }, [user, item._id]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(addToCart({ ...item, name: item.title, quantity: 1 }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);


    const rect = event.currentTarget.getBoundingClientRect();
    const startX = event.clientX || (rect.left + rect.width / 2);
    const startY = event.clientY || (rect.top + rect.height / 2);

    let targetX = window.innerWidth - 80;
    let targetY = 30;

    const targetEl = document.querySelector(".cart-glow-target");
    if (targetEl) {
      const targetRect = targetEl.getBoundingClientRect();
      targetX = targetRect.left + targetRect.width / 2;
      targetY = targetRect.top + targetRect.height / 2;
    }

    const particle = document.createElement("div");
    particle.className = "fixed pointer-events-none rounded-full z-[10000] shadow-[0_0_15px_rgba(225,220,201,0.85)]";
    particle.style.width = "14px";
    particle.style.height = "14px";
    particle.style.background = "radial-gradient(circle, #e1dcc9 20%, #412d15 100%)";
    particle.style.left = `${startX - 7}px`;
    particle.style.top = `${startY - 7}px`;
    document.body.appendChild(particle);

    const duration = 800;
    const startTime = performance.now();

    const animateParticle = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);


      const cpX = (startX + targetX) / 2;
      const cpY = Math.min(startY, targetY) - 180;

      const x = (1 - progress) * (1 - progress) * startX + 2 * (1 - progress) * progress * cpX + progress * progress * targetX;
      const y = (1 - progress) * (1 - progress) * startY + 2 * (1 - progress) * progress * cpY + progress * progress * targetY;

      const scale = 1 - progress * 0.55;
      const opacity = 1 - progress * 0.25;

      particle.style.left = `${x - 7}px`;
      particle.style.top = `${y - 7}px`;
      particle.style.transform = `scale(${scale})`;
      particle.style.opacity = opacity;

      if (progress < 1) {
        requestAnimationFrame(animateParticle);
      } else {
        particle.remove();
        const targets = document.querySelectorAll(".cart-glow-target");
        targets.forEach((t) => {
          t.classList.add("scale-[1.28]", "rotate-[8deg]", "duration-200");
          setTimeout(() => {
            t.classList.remove("scale-[1.28]", "rotate-[8deg]", "duration-200");
          }, 300);
        });
      }
    };

    requestAnimationFrame(animateParticle);
  };

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      return navigate("/login");
    }

    try {
      setLoading(true);
      const response = await api.post(`/auth/wishlist/${item._id}`);
      const wishlist = response.data?.data?.wishlist || [];
      const wishlistIds = new Set(
        (wishlist || []).map((entry) =>
          typeof entry === "string" ? entry : entry?._id?.toString()
        )
      );
      const isSaved = wishlistIds.has(item._id?.toString());
      setIsWishlisted(isSaved);
      dispatch(updateWishlist(wishlist));
      localStorage.setItem("user", JSON.stringify({ ...user, wishlist }));
    } catch (error) {
      console.error("Wishlist update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.045, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/product/${item._id}`} className="group block">
        <div
          onMouseMove={handleMouseMove}
          className="relative overflow-hidden rounded-2xl border border-[#412d15]/70 bg-[#1f150c]/42 shadow-premium transition duration-500 hover:-translate-y-1 hover:border-[#e1dcc9]/25 hover:shadow-premium-hover md:rounded-[28px] spotlight-card"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-[#1f150c] md:aspect-[4/5] md:rounded-t-[28px]">
            <SmartImage
              src={item.image}
              alt={item.title}
              aspectRatio=""
              containerClassName="absolute inset-0 w-full h-full"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/24 to-transparent opacity-90 md:opacity-70" />

            <div className="absolute left-3 top-3 z-10 flex gap-2">
              <span className="rounded-full border border-[#e1dcc9]/25 bg-black/62 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#e1dcc9] backdrop-blur-md">
                New
              </span>
              {discount > 0 && (
                <span className="rounded-full border border-[#e1dcc9]/25 bg-[#412d15]/78 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#e1dcc9] backdrop-blur-md">
                  Sale
                </span>
              )}
            </div>

            <button
              onClick={handleWishlist}
              style={{
                "--heart-border": isWishlisted ? "#cc3333" : "rgba(204,51,51,0.7)",
                "--heart-bg": isWishlisted ? "rgba(204,51,51,0.18)" : "rgba(0,0,0,0.58)",
              }}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-95 wishlist-heart-btn"
              aria-label="Toggle wishlist"
            >
              <Heart
                className={`transition-all duration-300 ${
                  isWishlisted
                    ? "h-4 w-4 fill-[#cc3333] text-[#cc3333] drop-shadow-[0_0_10px_rgba(204,51,51,0.7)]"
                    : "h-4 w-4 fill-transparent text-[#cc3333]"
                }`}
              />
            </button>

            <div className="absolute inset-x-0 bottom-0 z-10 p-3 md:hidden">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#e1dcc9]/58">
                {item.category}
              </p>
              <h3 className="line-clamp-2 text-sm font-black uppercase leading-tight tracking-[0.06em] text-[#e1dcc9]">
                {item.title}
              </h3>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="text-sm font-black text-[#e1dcc9]">₹{Math.round(item.price).toLocaleString("en-IN")}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#e1dcc9]/72">
                  <Star className="h-3 w-3 fill-[#e1dcc9] text-[#e1dcc9]" />
                  {item.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-3 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={addedToCart ? "outline" : "premium"}
                  className={`flex-1 rounded-full py-4 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                    addedToCart
                      ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-400"
                      : ""
                  }`}
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                      Add
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 rounded-full border-[#e1dcc9]/15 bg-black/75 p-0 text-[#e1dcc9] hover:bg-[#e1dcc9] hover:text-black"
                  aria-label="Quick view"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/product/${item._id}`);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden p-5 md:block">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#e1dcc9]/55">
              {item.category}
            </p>
            <h3 className="mt-2 line-clamp-1 text-xl font-black uppercase leading-tight tracking-[0.08em] text-[#e1dcc9] transition group-hover:text-white">
              {item.title}
            </h3>
            <p className="mt-2 min-h-[38px] line-clamp-2 text-xs leading-relaxed text-[#e1dcc9]/58">
              {item.description}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[#412d15]/55 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-[#e1dcc9]">₹{Math.round(item.price).toLocaleString("en-IN")}</span>
                {item.originalPrice > 0 && (
                  <span className="text-xs text-[#e1dcc9]/38 line-through">
                    ₹{Math.round(item.originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-[#e1dcc9]/78">
                <Star className="h-3.5 w-3.5 fill-[#e1dcc9] text-[#e1dcc9]" />
                {item.rating.toFixed(1)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`mt-4 w-full rounded-full border-[#412d15] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                addedToCart
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-400"
                  : "text-[#e1dcc9] hover:border-[#e1dcc9] hover:bg-[#e1dcc9] hover:text-black"
              }`}
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              {addedToCart ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
