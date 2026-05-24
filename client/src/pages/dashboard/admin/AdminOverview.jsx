import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LoaderWrapper } from "../../../lib/loadingUtils";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Sparkles,
  Award,
} from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AdminOverview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Platform Analytics from backend
  const { 
    data: analytics, 
    isLoading: analyticsLoading, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data.data;
    },
  });

  // Fetch Pending Vendors
  const { 
    data: pendingVendors, 
    isLoading: vendorsLoading, 
    error: vendorsError, 
    refetch: refetchVendors 
  } = useQuery({
    queryKey: ["pendingVendors"],
    queryFn: async () => {
      const res = await api.get("/admin/vendors/pending");
      return res.data.data;
    },
  });

  // Approve Vendor Mutation
  const approveVendorMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/admin/vendors/${id}/approve`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["pendingVendors"] });
      toast.success("Vendor approved successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to approve vendor.");
    },
  });

  // Reject Vendor Mutation
  const rejectVendorMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/admin/vendors/${id}/reject`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["pendingVendors"] });
      toast.success("Vendor registration rejected.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reject vendor.");
    },
  });


  const statItems = [
    {
      label: "Platform Members",
      value: analytics?.users?.total || 0,
      trend: `${analytics?.users?.sellers || 0} Vendors approved`,
      icon: Users,
      color: "from-amber-500/20 to-yellow-600/10 border-amber-500/20",
    },
    {
      label: "Catalog Listings",
      value: analytics?.totalProducts || 0,
      trend: "Verified Items",
      icon: ShoppingBag,
      color: "from-zinc-800/50 to-zinc-900/50 border-zinc-700/30",
    },
    {
      label: "Gross Platform Revenue",
      value: `₹${analytics?.revenue?.totalRevenue?.toLocaleString() || 0}`,
      trend: "Cumulative sales",
      icon: TrendingUp,
      color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20",
    },
    {
      label: "Platform Net Commission",
      value: `₹${analytics?.revenue?.totalCommission?.toLocaleString() || 0}`,
      trend: "Direct earnings",
      icon: Percent,
      color: "from-[#e1dcc9]/10 to-[#412d15]/10 border-[#e1dcc9]/25",
    },
  ];

  if (analyticsError || vendorsError) {
    const handleRefetchAll = () => {
      refetchAnalytics();
      refetchVendors();
    };
    return (
      <div className="p-6">
        <QueryErrorPlaceholder 
          error={analyticsError || vendorsError} 
          refetch={handleRefetchAll} 
          message="Failed to load administrator dashboard command data." 
        />
      </div>
    );
  }

  return (
    <LoaderWrapper loading={analyticsLoading || vendorsLoading} text="Analyzing platform operations..." subtitle="SYSTEM ADMIN SECURITY CORE" minHeight="400px">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Administrator Command
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e1dcc9]/10 border border-[#e1dcc9]/20 text-[#e1dcc9] flex items-center gap-1 shadow-glow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#e1dcc9]" /> Systems Engaged
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Platform performance analytics, vendor registrations, active commissions, and refund dispatch controls.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className={`relative overflow-hidden bg-gradient-to-br ${item.color} border rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 group`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-[#e1dcc9]/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#412d15]/50 flex items-center justify-center border border-[#e1dcc9]/10">
                  <Icon className="w-5 h-5 text-[#e1dcc9]" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-black/20 px-2 py-1 rounded-md">
                  {item.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-foreground tracking-tight mt-2">
                {item.value}
              </h3>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Vendor Approvals Table */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#412d15] flex items-center justify-center">
                <Award className="w-4 h-4 text-[#e1dcc9]" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Vendor Approvals Panel</h3>
                <p className="text-[10px] text-muted-foreground">Sellers waiting for marketplace verification</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
              {pendingVendors?.length || 0} Pending Approval
            </span>
          </div>

          {/* Pending table */}
          <div className="space-y-4">
            {!pendingVendors || pendingVendors.length === 0 ? (
              <div className="p-12 border border-dashed border-[#412d15] rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400/80 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground">All Registration Queues Clear</p>
                <p className="text-[10px] text-muted-foreground/60">No pending seller accounts are currently waiting review.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#412d15]/30 pb-2 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                      <th className="py-2">Store Profile</th>
                      <th className="py-2">Contact</th>
                      <th className="py-2">Location</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#412d15]/10">
                    {pendingVendors.map((vendor) => (
                      <tr key={vendor._id} className="hover:bg-[#412d15]/10">
                        <td className="py-3 font-semibold text-foreground">
                          {vendor.storeName || "Premium Boutique"}
                          <span className="text-[9px] text-muted-foreground block font-normal">
                            {vendor.name}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">{vendor.email}</td>
                        <td className="py-3 text-muted-foreground">{vendor.vendorLocation || "N/A"}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveVendorMutation.mutate(vendor._id)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 transition-all"
                              title="Approve Store"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => rejectVendorMutation.mutate(vendor._id)}
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:scale-105 transition-all"
                              title="Reject Registration"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Elite Vendors Leaderboard Widget */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Platform Elite Sellers</h3>
                <p className="text-[10px] text-muted-foreground">Top 5 vendors sorted by sales volume</p>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 mt-4">
              {analytics?.topVendors && analytics.topVendors.length > 0 ? (
                analytics.topVendors.map((vendor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/25 border border-[#412d15]/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {vendor.seller?.storeName || "Premium Store"}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {vendor.orderCount} checkouts handled
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#e1dcc9]">
                      ₹{Math.round(vendor.totalSales).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 border border-dashed border-[#412d15] rounded-xl text-center text-xs text-muted-foreground">
                  No listings sold yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#412d15]/50 text-center text-[10px] text-muted-foreground">
            System performance is fully nominal. 🚀
          </div>
        </motion.div>
      </div>
      </motion.div>
    </LoaderWrapper>
  );
}
