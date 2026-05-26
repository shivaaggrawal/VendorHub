import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Lock,
  ShieldCheck,
  CheckCircle,
  Package,
  X,
  Loader2,
  User,
  Home,
  MapPin,
  Shield,
  Phone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../redux/slices/cartSlice";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const FALLBACK_PRODUCTS = [
  {
    _id: "f1",
    name: "SHADOW DRIP",
    price: 7400.00,
    category: "Fashion",
    rating: 4.9,
    description: "A sleek, minimalist hoodie with dark tones and subtle reflective accents for an effortless street vibe.",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80"],
  },
  {
    _id: "f2",
    name: "URBAN PHANTOM",
    price: 7400.00,
    category: "Fashion",
    rating: 4.8,
    description: "Urban Phantom - A bold, oversized hoodie with edgy graphics and a stealthy aesthetic inspired by city nights.",
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"],
  }
];

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      const fetchRecs = async () => {
        setLoadingRecs(true);
        try {
          const { data } = await api.get("/products?limit=2");
          const list = data?.products || data?.data || data || [];
          setRecommendations(list.length > 0 ? list : FALLBACK_PRODUCTS);
        } catch (err) {
          console.error("Error fetching cart recommendations:", err);
          setRecommendations(FALLBACK_PRODUCTS);
        } finally {
          setLoadingRecs(false);
        }
      };
      fetchRecs();
    }
  }, [cartItems.length]);

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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const handlePay = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/cart`);
      return;
    }
    setShowCheckout(true);
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsPlacingOrder(true);

    try {
      const items = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const payload = {
        items,
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
            setPaymentSuccess(true);
            dispatch(clearCart());
            setShowCheckout(false);
            window.scrollTo(0, 0);
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
            setPaymentSuccess(true);
            dispatch(clearCart());
            setShowCheckout(false);
            window.scrollTo(0, 0);
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
      console.error("Order placement error:", err);
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


  if (paymentSuccess) {
    return (
      <div className="pt-6 sm:pt-10 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
                delay: 0.2,
              }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3"
            >
              Order Placed!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground max-w-md mb-8"
            >
              Thank you for shopping with VendorHub. Your order has been confirmed
              and you&apos;ll receive tracking information shortly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Link to="/orders/latest/tracking">
                <Button variant="premium" size="lg">
                  <Package className="w-5 h-5" />
                  Track Order
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="pt-6 sm:pt-10 pb-16 bg-[#000000] min-h-screen text-[#e1dcc9]">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center py-8">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1 p-8 rounded-[32px] bg-[#1f150c] border border-[#412d15] shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-primary/5 rounded-full blur-2xl" />
              <div className="w-16 h-16 rounded-2xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-[#e1dcc9]" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white font-anton uppercase mb-3">
                Cart is Empty
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed mb-8">
                Your luxury shopping cart holds no active drop reservations. Explore our exclusive catalog to discover premium technical items.
              </p>
              <Link to="/explore">
                <Button variant="premium" size="lg" className="w-full gap-2 rounded-xl">
                  Explore Catalog
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>


            <div className="lg:col-span-2 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-[#e1dcc9]/50 tracking-[0.2em] uppercase mb-2">Highly Coveted Drops</p>
                <h2 className="text-2xl font-black text-white font-anton uppercase tracking-wide">
                  RECOMMENDED FOR YOU
                </h2>
              </div>

              {loadingRecs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-[#1f150c] border border-[#412d15] rounded-2xl p-4 animate-pulse space-y-4">
                      <div className="aspect-[4/3] bg-[#412d15]/40 rounded-xl" />
                      <div className="h-4 bg-[#412d15]/40 rounded w-2/3" />
                      <div className="h-4 bg-[#412d15]/40 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recommendations.slice(0, 2).map((product, i) => (
                    <ProductCard key={product._id || i} product={product} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pt-6 sm:pt-10 pb-16 bg-background"
    >
      <div className="container mx-auto px-4 md:px-6">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300"
                >
                  <div className="flex gap-4">

                    <Link
                      to={`/product/${item._id}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-border/50">
                        <img
                          src={
                            item.images?.[0]?.url ||
                            item.images?.[0] ||
                            item.image ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80"
                          }
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>


                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item._id}`}
                            className="font-semibold text-foreground text-sm md:text-base hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.title || item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Sold by{" "}
                            <span className="font-medium">
                              {item.sellerId?.storeName || "VendorHub Seller"}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-auto pt-3 flex items-center justify-between">

                        <div className="flex items-center border border-border rounded-xl overflow-hidden">
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item._id,
                                  quantity: item.quantity - 1,
                                })
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold border-x border-border bg-background">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item._id,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>


                        <span className="text-base font-bold text-foreground">
                          ₹{Math.round(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-premium sticky top-28">
              <h2 className="text-lg font-bold text-foreground mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">
                    ₹{Math.round(subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span className="font-medium text-foreground">
                    ₹{Math.round(tax).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Free
                  </span>
                </div>

                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">
                      ₹{Math.round(total).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="premium"
                size="xl"
                className="w-full mt-6"
                onClick={handlePay}
              >
                <Lock className="w-4 h-4" />
                Pay Securely
              </Button>


              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>SSL Encrypted &bull; Secure Checkout</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-premium overflow-y-auto max-h-[90vh]"
            >

              <button
                onClick={() => setShowCheckout(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold text-foreground mb-1">Shipping Details</h2>
              <p className="text-xs text-muted-foreground mb-5">Please fill in your delivery details to complete the purchase.</p>

              {checkoutError && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
                  {checkoutError}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-4">
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
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-foreground">Total Payment</span>
                    <span className="text-lg font-bold text-foreground">₹{Math.round(total).toLocaleString("en-IN")}</span>
                  </div>

                  <Button
                    type="submit"
                    variant="premium"
                    size="lg"
                    className="w-full"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing Secure Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Place Secure Order &bull; ₹{Math.round(total).toLocaleString("en-IN")}
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
  );
};

export default CartPage;
