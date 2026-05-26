import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Truck,
  X,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import api from "../../../services/api";

import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";

const ORDER_STATUS_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"];

const statusStyles = {
  Placed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shipped: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SellerOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNote, setStatusNote] = useState("");


  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["sellerOrders"],
    queryFn: async () => {
      const res = await api.get("/seller/orders/incoming?limit=50");
      return res.data.data;
    },
  });


  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, nextStatus }) => {
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
        note: statusNote || `Status updated to ${nextStatus}`,
      });
      return res.data.data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });

      setSelectedOrder(updatedOrder);
      setStatusNote("");
      toast.success(`Advanced order pipeline to "${updatedOrder.orderStatus}" successfully!`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update order status.");
    },
  });

  const getNextStatus = (currentStatus) => {
    const currentIndex = ORDER_STATUS_STEPS.indexOf(currentStatus);
    if (currentIndex !== -1 && currentIndex < ORDER_STATUS_STEPS.length - 1) {
      return ORDER_STATUS_STEPS[currentIndex + 1];
    }
    return null;
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      updateStatusMutation.mutate({ orderId, nextStatus });
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Incoming Orders
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track customer purchases, manage statuses, and orchestrate logistics pipelines.
        </p>
      </div>


      <div className="bg-[#1f150c]/10 border border-[#412d15]/30 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#412d15]/30 bg-black/40 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Order ID & Date</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Net Earnings</th>
                <th className="py-4 px-6">Fullfillment Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#412d15]/10 bg-[#1f150c]/5">
              {error ? (
                <tr>
                  <td colSpan="5" className="p-4">
                    <QueryErrorPlaceholder
                      error={error}
                      refetch={refetch}
                      message="Failed to synchronize incoming buyer orders."
                    />
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-xs text-muted-foreground">
                    <div className="flex justify-center gap-2 items-center">
                      <div className="w-4 h-4 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
                      Fetching customer shipments...
                    </div>
                  </td>
                </tr>
              ) : !orders || orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-muted-foreground">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e1dcc9]" />
                    <p className="text-xs font-semibold text-foreground">No Customer Orders Received Yet</p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground/60">As soon as buyers checkout, their orders will appear here live.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return (
                    <tr
                      key={order._id}
                      className="group hover:bg-[#412d15]/20 border-b border-[#412d15]/10 transition-colors duration-300"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-black/35 flex items-center justify-center border border-[#412d15]/40 shrink-0">
                            <ShoppingCart className="w-4 h-4 text-[#e1dcc9]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" /> {formattedDate}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-muted-foreground font-semibold">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {order.shippingAddress?.name || "Premium Buyer"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-[#e1dcc9]">
                        ₹{Math.round(order.sellerEarnings || (order.totalAmount * 0.95)).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusStyles[order.orderStatus] || "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#412d15]/30 border border-[#e1dcc9]/5 hover:bg-[#e1dcc9]/10 text-xs font-semibold text-[#e1dcc9] transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Timeline
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />


            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="bg-[#1f150c] border-l border-[#412d15] w-full max-w-md h-full relative p-6 shadow-2xl z-10 flex flex-col justify-between"
            >

              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />


              <div>
                <div className="flex items-center justify-between border-b border-[#412d15] pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e1dcc9]" />
                    <div>
                      <h3 className="font-bold text-foreground text-sm">
                        AI Order Logistics Drawer
                      </h3>
                      <p className="text-[10px] text-muted-foreground">Order ID: #{selectedOrder._id.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 rounded-lg bg-black/35 hover:bg-black/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>


                <div className="space-y-3 mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Purchased Items</h4>
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/25 border border-[#412d15]/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-[#412d15]/50"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-foreground truncate max-w-[180px]">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">₹{Math.round(item.price).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>


                <div className="p-4 rounded-xl bg-[#412d15]/15 border border-[#412d15]/50 text-xs space-y-2 mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address
                  </h4>
                  <div className="text-foreground font-semibold">
                    {selectedOrder.shippingAddress?.name}
                  </div>
                  <div className="text-muted-foreground">
                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    Phone: <span className="text-foreground font-bold">{selectedOrder.shippingAddress?.phone}</span>
                  </div>
                </div>


                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Tracking Timeline</h4>
                  <div className="relative pl-6 border-l-2 border-[#412d15] space-y-6">
                    {ORDER_STATUS_STEPS.map((status, index) => {
                      const isCompleted = ORDER_STATUS_STEPS.indexOf(selectedOrder.orderStatus) >= index;
                      const isCurrent = selectedOrder.orderStatus === status;

                      return (
                        <div key={status} className="relative">

                          <div
                            className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
                              isCompleted
                                ? "bg-[#e1dcc9] border-[#e1dcc9] text-black shadow-glow-sm scale-110 font-black"
                                : "bg-black border-[#412d15] text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </div>

                          <div className="min-w-0">
                            <h5
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? "text-[#e1dcc9]"
                                  : isCompleted
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {status}
                            </h5>
                            <span className="text-[9px] text-muted-foreground/60 block mt-0.5">
                              {isCompleted ? "Pipeline Step Satisfied" : "Awaiting activation"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>


              <div className="border-t border-[#412d15] pt-4 mt-6 bg-[#1f150c] space-y-3">
                {getNextStatus(selectedOrder.orderStatus) && selectedOrder.orderStatus !== "Cancelled" ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Dispatch Notes / Comments
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shipment handoff to FedEx"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-[#e1dcc9]/50"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, selectedOrder.orderStatus)}
                      disabled={updateStatusMutation.isPending}
                      className="w-full py-2.5 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] active:scale-[0.98] transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-sm disabled:opacity-50"
                    >
                      {updateStatusMutation.isPending ? (
                        <div className="w-3.5 h-3.5 border-t-2 border-black border-solid rounded-full animate-spin"></div>
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                      Advance Pipeline to "{getNextStatus(selectedOrder.orderStatus)}" <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#412d15]/10 border border-[#412d15]/50 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Order Fulfillment Pipeline Complete
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
