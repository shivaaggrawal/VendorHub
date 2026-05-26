import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderWrapper } from "../lib/loadingUtils";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  Home,
  Shield,
  Truck,
  RotateCcw,
  MapPin,
  Store,
  Loader2,
  Check,
  X,
  Lock,
  User,
  Phone,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import api from "../services/api";

const fallbackProduct = {
  _id: "fallback-1",
  title: "Premium Wireless Headphones",
  description:
    "Experience unparalleled sound quality with active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions. Designed for audiophiles and professionals who demand the best.",
  price: 16500.00,
  discountedPrice: 20700.00,
  category: { name: "Electronics" },
  averageRating: 4.8,
  numReviews: 124,
  images: [
    { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
    { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800" },
    { url: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800" },
    { url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800" },
  ],
  features: [
    "Active Noise Cancellation",
    "40-hour battery life",
    "Bluetooth 5.3 connectivity",
    "Hi-Res Audio certified",
    "Memory foam ear cushions",
  ],
  sellerId: {
    storeName: "AudioPro Store",
    location: "Andheri, Mumbai",
  },
};

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);


  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setShippingAddress((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        street: prev.street || defaultAddr?.street || "",
        city: prev.city || defaultAddr?.city || "",
        state: prev.state || defaultAddr?.state || "",
        pincode: prev.pincode || defaultAddr?.pincode || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data?.data || data?.product || data);
      } catch {
        setProduct(fallbackProduct);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ ...product, quantity }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {

      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    setShowBuyNowModal(true);
  };

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout script."));
      document.body.appendChild(script);
    });

  const handlePlaceBuyNowOrder = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsPlacingOrder(true);

    try {
      const payload = {
        items: [
          {
            product: product._id,
            quantity: quantity,
          },
        ],
        shippingAddress,
      };

      const orderResponse = await api.post("/orders", payload);
      const order = orderResponse.data?.data;
      if (!order?._id) {
        throw new Error("Order placement failed.");
      }

      const paymentResponse = await api.post("/payment/create-order", {
        orderId: order._id,
      });
      const paymentData = paymentResponse.data?.data || {};


      if (paymentData.keyId?.startsWith("rzp_test_dummy")) {
        setTimeout(async () => {
          try {
            const mockPaymentId = `pay_dummy_${Math.random().toString(36).substring(2, 15)}`;
            await api.post("/payment/verify", {
              razorpayOrderId: paymentData.razorpayOrderId,
              razorpayPaymentId: mockPaymentId,
              razorpaySignature: "mock_signature_for_dummy_mode",
            });
            setShowBuyNowModal(false);
            const orderId = order._id;
            navigate(`/orders/${orderId}/tracking?success=true`);
          } catch (verifyError) {
            console.error("Mock payment verification failed:", verifyError);
            setCheckoutError(
              verifyError.response?.data?.message ||
                "Mock payment verification failed. Please try again."
            );
          } finally {
            setIsPlacingOrder(false);
          }
        }, 1500);
        return;
      }

      await loadRazorpayScript();

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "VendorHub",
        description: "Secure marketplace checkout",
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: shippingAddress.name,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        handler: async (paymentResult) => {
          try {
            await api.post("/payment/verify", {
              razorpayOrderId: paymentResult.razorpay_order_id,
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpaySignature: paymentResult.razorpay_signature,
            });
            setShowBuyNowModal(false);
            const orderId = order._id;
            navigate(`/orders/${orderId}/tracking?success=true`);
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            setCheckoutError(
              verifyError.response?.data?.message ||
                "Payment verification failed. Please try again."
            );
          }
        },
        theme: {
          color: "#8b5cf6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Buy now order placement error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Failed to place order. Please check that all shipping fields are correctly formatted.";
      setCheckoutError(errMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const images = product?.images?.length
    ? product.images
    : fallbackProduct.images;

  const isDiscounted =
    product?.discountedPrice && product.discountedPrice > product.price;
  const originalPrice = isDiscounted ? product.discountedPrice : null;
  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const features = product?.features?.length
    ? product.features
    : fallbackProduct.features;

  const rating = product?.averageRating || 4.8;
  const numReviews = product?.numReviews || 124;


  return (
    <LoaderWrapper
      loading={loading}
      text="Loading product details and authentication profile..."
      subtitle="PRODUCT SECURITY VERIFICATION"
      fullScreen={false}
      minHeight="400px"
      preserveLayout={false}
    >
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="pt-6 sm:pt-10 pb-16 bg-background"
    >
      <div className="container mx-auto px-4 md:px-6">

        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8"
        >
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to={`/explore?category=${product.category?.name || "All"}`}
            className="hover:text-primary transition-colors"
          >
            {product.category?.name || "Products"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {product.title}
          </span>
        </motion.nav>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-border shadow-premium">
              <img
                src={images[selectedImage]?.url || images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              {isDiscounted && (
                <span className="absolute top-4 left-4 bg-[#412d15]/85 text-[#e1dcc9] border border-[#e1dcc9]/20 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md">
                  -{discount}% OFF
                </span>
              )}
            </div>


            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === idx
                      ? "border-primary shadow-glow-sm ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <img
                    src={img.url || img}
                    alt={`${product.title} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >

            <span className="inline-flex self-start items-center text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
              {product.category?.name || "Premium Item"}
            </span>


            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(rating)
                        ? "text-[#e1dcc9] fill-[#e1dcc9]"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({numReviews} reviews)
              </span>
            </div>


            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              {product.title}
            </h1>


            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">
                ₹{Math.round(product.price).toLocaleString("en-IN")}
              </span>
              {originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{Math.round(originalPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-semibold text-[#e1dcc9] bg-[#412d15]/50 border border-[#e1dcc9]/10 px-2 py-0.5 rounded-full">
                    Save ₹{Math.round(originalPrice - product.price).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>


            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description || fallbackProduct.description}
            </p>


            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>


            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-foreground">
                Quantity
              </span>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-border bg-background">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>


            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                variant={addedToCart ? "glow" : "premium"}
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5 mr-1.5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-1.5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="orange"
                size="xl"
                className="flex-1 shadow-glow-sm"
                onClick={handleBuyNow}
              >
                <Lock className="w-4 h-4 mr-1.5" />
                Buy Now
              </Button>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Shield, label: "2-Year Warranty" },
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "30-Day Returns" },
              ].map(({ icon: Icon, label }, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/50 text-center"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>


            <div className="bg-card border border-border rounded-2xl p-5 shadow-premium">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-sm">
                  <span className="text-white font-bold text-lg">
                    {(product.sellerId?.storeName || "V")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {product.sellerId?.storeName || "VendorHub Seller"}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {product.sellerId?.location || "Worldwide"}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/explore?search=${encodeURIComponent(
                    product.sellerId?.storeName || ""
                  )}`}
                >
                  <Button variant="outline" size="sm">
                    <Store className="w-4 h-4" />
                    View Store
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


      <AnimatePresence>
        {showBuyNowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-premium overflow-y-auto max-h-[90vh]"
            >

              <button
                onClick={() => setShowBuyNowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="h-7 w-7 rounded-lg bg-[#412d15]/45 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#e1dcc9]" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Instant Buy Now Checkout</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">Confirm your secure 1-Click order for this item below.</p>

              {checkoutError && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
                  {checkoutError}
                </div>
              )}


              <div className="mb-5 p-3.5 rounded-xl bg-muted/30 border border-border/60 flex gap-3.5 items-center">
                <img
                  src={images[0]?.url || images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80"}
                  alt={product.title}
                  className="w-12 h-12 rounded-lg object-cover bg-background border border-border/50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{product.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Quantity: {quantity} &bull; Sold by {product.sellerId?.storeName || "VendorHub Seller"}</p>
                </div>
              </div>

              <form onSubmit={handlePlaceBuyNowOrder} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Recipient Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 bg-black/55 border border-[#412d15] rounded-xl text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/25 outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Street Address</label>
                  <div className="relative">
                    <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 bg-black/55 border border-[#412d15] rounded-xl text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/25 outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all duration-300"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 bg-black/55 border border-[#412d15] rounded-xl text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/25 outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all duration-300"
                        placeholder="Mumbai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">State</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 bg-black/55 border border-[#412d15] rounded-xl text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/25 outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all duration-300"
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Pincode (6 Digits)</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        pattern="^\d{6}$"
                        maxLength={6}
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 bg-black/55 border border-[#412d15] rounded-xl text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/25 outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all duration-300"
                        placeholder="400001"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        pattern="^[6-9]\d{9}$"
                        maxLength={10}
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 bg-black/55 border border-[#412d15] rounded-xl text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/25 outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all duration-300"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-6">
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">₹{Math.round(product.price * quantity).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Tax (8%)</span>
                      <span className="font-semibold text-foreground">₹{Math.round(product.price * quantity * 0.08).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="font-bold text-[#e1dcc9]">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border/40">
                      <span>Total Payment</span>
                      <span>₹{Math.round(product.price * quantity * 1.08).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="orange"
                    size="lg"
                    className="w-full"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Placing Order securely...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Place 1-Click Order &bull; ₹{Math.round(product.price * quantity * 1.08).toLocaleString("en-IN")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </motion.div>
      )}
    </LoaderWrapper>
  );
};

export default ProductDetails;

