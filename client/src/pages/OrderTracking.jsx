import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  ShoppingBag,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import api from "../services/api";
import Loader from "../components/Loader";

const steps = [
  {
    label: "Order Placed",
    description: "Your order has been received",
    icon: ShoppingBag,
  },
  {
    label: "Confirmed",
    description: "Seller confirmed your order",
    icon: CheckCircle,
  },
  {
    label: "Shipped",
    description: "Package is on the way",
    icon: Truck,
  },
  {
    label: "Delivered",
    description: "Arrives at your doorstep",
    icon: MapPin,
  },
];

const OrderTracking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/orders/${id || "latest"}/tracking`);
    }
  }, [isAuthenticated, navigate, id]);


  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        const ordersList = data?.orders || data?.data || data || [];
        setOrders(ordersList);
        if (ordersList.length > 0) {
          const requestedOrder =
            id && id !== "latest"
              ? ordersList.find((order) => order._id === id || order._id?.slice(-8).toLowerCase() === id.toLowerCase())
              : null;
          setSelectedOrder(requestedOrder || ordersList[0]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, id]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 pt-6 sm:pt-10 pb-16 bg-background min-h-screen">
        <Loader
          fullScreen={false}
          text="Initializing secure shipment transit mapping..."
          subtitle="LOGISTICS TELEMETRY SYNC"
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="pt-6 sm:pt-10 pb-16 bg-background min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-[32px] bg-[#1f150c] border border-[#412d15] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-primary/5 rounded-full blur-2xl" />
            <div className="w-16 h-16 rounded-2xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-[#e1dcc9]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-anton uppercase mb-3">
              No Active Shipments
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Your digital signature holds no active packages. Acquire items from our luxury catalog to initialize cinematic tracking.
            </p>
            <Button
              onClick={() => navigate("/explore")}
              variant="premium"
              className="w-full gap-2 rounded-xl py-6"
            >
              Explore Premium Catalog
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const getStepIndex = (status) => {
    switch (status) {
      case "Placed": return 0;
      case "Confirmed": return 1;
      case "Shipped": return 2;
      case "Delivered": return 3;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(selectedOrder.orderStatus);
  const isCancelled = selectedOrder.orderStatus === "Cancelled";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pt-6 sm:pt-10 pb-16 bg-background min-h-screen"
    >
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">

        {orders.length > 1 && (
          <div className="relative mb-6">
            <button
              onClick={() => setSelectorOpen((prev) => !prev)}
              className="w-full flex items-center justify-between bg-[#1f150c] border border-[#412d15] rounded-2xl px-5 py-4 text-left shadow-lg hover:border-[#e1dcc9]/30 transition-all duration-300"
            >
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Shipments ({orders.length})</p>
                <p className="text-sm font-bold text-[#e1dcc9] mt-0.5">
                  Currently tracking: #{selectedOrder._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${selectorOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {selectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-2 rounded-2xl border border-[#412d15] bg-[#1f150c] shadow-2xl z-40 overflow-hidden"
                >
                  <div className="max-h-60 overflow-y-auto divide-y divide-[#412d15]/50">
                    {orders.map((order) => (
                      <button
                        key={order._id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setSelectorOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#412d15]/30 transition-colors text-left ${
                          selectedOrder._id === order._id ? "bg-[#412d15]/20" : ""
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">Order #{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.orderStatus === "Delivered" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            order.orderStatus === "Cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            "bg-[#412d15] text-[#e1dcc9]"
                          }`}>
                            {order.orderStatus}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}


        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#e1dcc9] bg-[#412d15] border border-[#e1dcc9]/10 px-3.5 py-1.5 rounded-full mb-3 shadow-md">
                Tracking Order #{selectedOrder._id.slice(-8).toUpperCase()}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-anton uppercase">
                Shipment Status
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="text-sm font-bold text-[#e1dcc9]">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>


        {isCancelled ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-950/20 border border-red-900/40 rounded-[28px] p-6 md:p-8 mb-8 text-center shadow-lg"
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 font-anton uppercase mb-2">Order Cancelled</h2>
            <p className="text-sm text-red-300/80 max-w-md mx-auto mb-4">
              This order was cancelled by {selectedOrder.cancelledBy || "the store owner"}.
            </p>
            {selectedOrder.cancellationNote && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 max-w-md mx-auto text-xs text-red-300">
                <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">Reason</span>
                "{selectedOrder.cancellationNote}"
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#1f150c] border border-[#412d15]/60 rounded-[28px] p-6 md:p-8 shadow-premium mb-8 relative overflow-hidden"
          >

            <div className="relative mb-10 pt-2">

              <div className="absolute top-7 left-5 right-5 h-1 bg-[#412d15]/50 rounded-full" />

              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="absolute top-7 left-5 h-1 gradient-primary rounded-full"
                style={{ maxWidth: "calc(100% - 40px)" }}
              />


              <div className="relative flex justify-between">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isComplete = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                      className="flex flex-col items-center text-center z-10"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isComplete
                            ? "gradient-primary border-transparent shadow-glow-sm"
                            : "bg-black border-[#412d15]"
                        } ${isCurrent ? "ring-4 ring-[#e1dcc9]/20" : ""}`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isComplete
                              ? "text-white animate-pulse"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider mt-3 ${
                          isComplete
                            ? "text-foreground font-semibold text-[#e1dcc9]"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-black/50 border border-[#412d15]/50 rounded-2xl p-4 flex items-start gap-3"
            >
              <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#e1dcc9]">
                  {currentStep === 0 && "Your order is logged and awaiting dispatch validation."}
                  {currentStep === 1 && "The vendor has prepared your dispatch container."}
                  {currentStep === 2 && "Package is flying on route to destination node."}
                  {currentStep === 3 && "Secure capsule safely locked into terminal destination."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active carrier: <span className="font-semibold text-foreground">VendorHub Premium Logistics</span>.
                  {currentStep === 3
                    ? " Delivery finalized successfully."
                    : " Processing under priority transit status protocol."}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1f150c] border border-[#412d15]/60 rounded-[28px] p-6 shadow-premium"
        >
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground font-anton uppercase tracking-wider">
              Shipment Container Items
            </h2>
          </div>

          <div className="space-y-4">
            {selectedOrder.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-[#412d15]/50"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-[#412d15]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#e1dcc9] truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Qty: {item.quantity} × <span className="text-[#e1dcc9]/70">₹{Math.round(item.price).toLocaleString("en-IN")}</span>
                  </p>
                </div>
                <span className="text-sm font-bold text-[#e1dcc9] flex-shrink-0">
                  ₹{Math.round(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>


          <div className="border-t border-[#412d15]/50 mt-6 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Destination Capsule</p>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p className="font-semibold text-[#e1dcc9]">{selectedOrder.shippingAddress.name}</p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                <p className="text-[10px] mt-1 font-bold text-[#e1dcc9]/70">{selectedOrder.shippingAddress.country}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Consolidated Totals</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Math.round(selectedOrder.totalAmount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-foreground font-bold text-[#e1dcc9] border-t border-[#412d15]/30 pt-1.5">
                  <span>Total Amount</span>
                  <span>₹{Math.round(selectedOrder.totalAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>


          <div className="mt-8 flex gap-3.5">
            <Link to="/explore" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl py-5">
                Continue Shopping
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="premium" className="w-full rounded-xl py-5">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderTracking;
