import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ShoppingCart, RotateCcw } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";

const statusStyles = {
  Placed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shipped: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const paymentStyles = {
  Pending: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Failed: "bg-red-500/10 text-red-400 border-red-500/20",
  Refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all orders across the platform
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["adminAllOrders"],
    queryFn: async () => {
      const res = await api.get("/admin/orders?limit=100");
      return res.data.data;
    },
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/admin/orders/${id}/refund`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllOrders"] });
      toast.success("Refund processed successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to process refund. Ensure payment gateway keys are set.");
    },
  });

  const handleRefund = (id) => {
    if (window.confirm("Are you sure you want to approve and issue a full refund for this order? This cannot be undone.")) {
      refundMutation.mutate(id);
    }
  };

  const filteredOrders = orders?.filter((o) =>
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Platform Transactions
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Audit and manage all platform checkouts, track payment gateways, and authorize customer refund dispatches.
        </p>
      </div>

      {/* Control row */}
      <div className="flex items-center gap-3 bg-secondary/35 border border-[#412d15]/30 rounded-xl p-3 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter transactions by Order ID, buyer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 outline-none text-xs w-full text-foreground placeholder-muted-foreground"
        />
      </div>

      {/* Transactions table */}
      <div className="bg-[#1f150c]/10 border border-[#412d15]/30 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#412d15]/30 bg-black/40 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Transaction / Order ID</th>
                <th className="py-4 px-6">Buyer Profile</th>
                <th className="py-4 px-6">Gross Total</th>
                <th className="py-4 px-6">Order Status</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6 text-right">Auditing Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#412d15]/10 bg-[#1f150c]/5">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-xs text-muted-foreground">
                    Fetching platform transactions ledgers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-4">
                    <QueryErrorPlaceholder error={error} refetch={refetch} message="Failed to load platform transactions." />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-muted-foreground">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e1dcc9]" />
                    <p className="text-xs font-semibold text-foreground">No Platform Orders Audited Yet</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isRefundRequested = order.refundStatus === "requested";
                  const canRefund = order.paymentStatus === "Paid" && order.refundStatus !== "processed";

                  return (
                    <tr
                      key={order._id}
                      className="group hover:bg-[#412d15]/20 border-b border-[#412d15]/10 transition-colors duration-300"
                    >
                      <td className="py-4 px-6 font-mono text-[10px] text-muted-foreground font-bold">
                        #{order._id.toUpperCase()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate max-w-[200px]">
                            {order.buyerId?.name || "Premium Buyer"}
                          </p>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {order.buyerId?.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-foreground">
                        ₹{Math.round(order.totalAmount).toLocaleString("en-IN")}
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
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            paymentStyles[order.paymentStatus] || "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isRefundRequested ? (
                          <button
                            onClick={() => handleRefund(order._id)}
                            className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 active:scale-[0.98] transition-all text-[10px] font-bold flex items-center gap-1 ml-auto shadow-glow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Approve Refund
                          </button>
                        ) : canRefund ? (
                          <button
                            onClick={() => handleRefund(order._id)}
                            className="px-3 py-1.5 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/5 hover:bg-purple-500/10 hover:text-purple-400 text-[10px] font-semibold text-muted-foreground transition-all ml-auto"
                          >
                            Trigger Refund
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 italic font-medium">Audited</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
