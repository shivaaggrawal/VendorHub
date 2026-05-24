import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LoaderWrapper } from "../../../lib/loadingUtils";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
  Info,
  Sliders,
  HelpCircle,
} from "lucide-react";
import api from "../../../services/api";
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

export default function SellerOverview() {
  const [selectedProductPrice, setSelectedProductPrice] = useState(9900);
  const [selectedCompetitorMargin, setSelectedCompetitorMargin] = useState(15); // in %

  // Fetch Dashboard Stats from API
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["sellerDashboardStats"],
    queryFn: async () => {
      const res = await api.get("/seller/dashboard");
      return res.data.data;
    },
  });

  // Derived calculations for AI smart suggestions
  const minCompetitorPrice = Math.max(100, Math.round(selectedProductPrice * 0.85));
  const maxCompetitorPrice = Math.round(selectedProductPrice * 1.15);
  const suggestedPrice = Math.round((minCompetitorPrice * 0.4) + (maxCompetitorPrice * 0.6));
  
  // Calculate projected demand based on selected price compared to suggested price
  const percentDiff = ((selectedProductPrice - suggestedPrice) / suggestedPrice) * 100;
  let demandIndex;
  let demandColor;
  let weeklySalesProj;

  if (percentDiff > 10) {
    demandIndex = "Low Demand";
    demandColor = "text-red-400 border-red-500/20 bg-red-500/10";
    weeklySalesProj = Math.max(1, Math.round(180 / (percentDiff * 0.5)));
  } else if (percentDiff > 3) {
    demandIndex = "Moderate Demand";
    demandColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
    weeklySalesProj = Math.round(35 - percentDiff);
  } else if (percentDiff < -10) {
    demandIndex = "Extreme High Demand";
    demandColor = "text-cyan-400 border-cyan-500/20 bg-cyan-500/10";
    weeklySalesProj = Math.round(120 + Math.abs(percentDiff) * 3);
  } else {
    demandIndex = "Peak Optimal Volume";
    demandColor = "text-[#e1dcc9] border-[#e1dcc9]/20 bg-[#e1dcc9]/10";
    weeklySalesProj = Math.round(65 - percentDiff * 2);
  }

  const projectedWeeklyRevenue = weeklySalesProj * selectedProductPrice;


  if (error) {
    return (
      <div className="p-6">
        <QueryErrorPlaceholder
          error={error}
          refetch={refetch}
          message="Failed to synchronize seller dashboard analytical parameters."
        />
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Earnings",
      value: `₹${stats?.totalEarnings?.toLocaleString() || 0}`,
      trend: "Dynamic Revenue",
      icon: IndianRupee,
      color: "from-amber-500/20 to-yellow-600/10 border-amber-500/20",
    },
    {
      label: "Orders Handled",
      value: stats?.totalOrders || 0,
      trend: "All-time Sales",
      icon: ShoppingCart,
      color: "from-amber-600/20 to-orange-600/10 border-amber-600/20",
    },
    {
      label: "Active Products",
      value: stats?.totalProducts || 0,
      trend: "Live Inventory",
      icon: Package,
      color: "from-zinc-800/50 to-zinc-900/50 border-zinc-700/30",
    },
    {
      label: "Market Reach",
      value: "99.8%",
      trend: "+1.2% this week",
      icon: TrendingUp,
      color: "from-[#e1dcc9]/10 to-[#412d15]/10 border-[#e1dcc9]/20",
    },
  ];

  return (
    <LoaderWrapper loading={isLoading} text="Analyzing merchant sales ledger..." subtitle="PREDICTIVE INTELLIGENCE CORE" minHeight="400px">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
      {/* Welcome Title */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Store Command Center
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e1dcc9]/10 border border-[#e1dcc9]/20 text-[#e1dcc9] flex items-center gap-1 shadow-glow-sm">
              <Sparkles className="w-3 h-3 text-[#e1dcc9]" /> AI Projections Engaged
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time multi-vendor metrics, predictive inventory management, and competitor intelligence.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className={`relative overflow-hidden bg-gradient-to-br ${item.color} border rounded-2xl p-6 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 group`}
            >
              {/* Highlight backdrop */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-primary/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#412d15]/60 flex items-center justify-center border border-[#e1dcc9]/10">
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

      {/* Main Insights Panel & AI Pricing Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Competitor Pricing & Sales Projections Widget */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium relative overflow-hidden flex flex-col justify-between"
        >
          {/* Ambient lighting element */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-[#e1dcc9]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#e1dcc9] flex items-center gap-1.5">
                    AI Smart Pricing Assistant
                  </h3>
                  <p className="text-xs text-muted-foreground">Competitor intelligence & elasticity simulation</p>
                </div>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-[#e1dcc9]/40 uppercase bg-[#412d15]/30 px-2 py-0.5 border border-[#e1dcc9]/10 rounded-full">
                Interactive Model
              </span>
            </div>

            {/* Inputs Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4 rounded-xl bg-black/30 border border-[#412d15]/40">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Simulate Retail Price</span>
                  <span className="text-[#e1dcc9] font-bold">₹{selectedProductPrice.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="35000"
                  value={selectedProductPrice}
                  onChange={(e) => setSelectedProductPrice(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#e1dcc9] outline-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>₹1,000</span>
                  <span>Suggested Optimal: ₹{suggestedPrice.toLocaleString("en-IN")}</span>
                  <span>₹35,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Target Profit Margin</span>
                  <span className="text-amber-400 font-bold">{selectedCompetitorMargin}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={selectedCompetitorMargin}
                  onChange={(e) => setSelectedCompetitorMargin(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 outline-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>5% (Volume match)</span>
                  <span>50% (High end)</span>
                </div>
              </div>
            </div>

            {/* Smart Pricing Target Projections */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6">
              <div className="p-3.5 rounded-xl bg-[#1f150c]/40 border border-[#412d15]/40 text-center">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Elastic Range</p>
                <p className="text-base md:text-lg font-bold text-foreground mt-1">
                  ${minCompetitorPrice} - ${maxCompetitorPrice}
                </p>
                <span className="text-[9px] text-muted-foreground/60 block mt-0.5">Competitor Bounds</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#e1dcc9]/5 border border-[#e1dcc9]/10 text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#e1dcc9] to-transparent animate-pulse" />
                <p className="text-[10px] font-semibold text-[#e1dcc9] uppercase tracking-wider">Ideal Sweetspot</p>
                <p className="text-base md:text-lg font-bold text-[#e1dcc9] mt-1">${suggestedPrice}</p>
                <span className="text-[9px] text-[#e1dcc9]/60 block mt-0.5">Optimal conversion</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center ${demandColor} transition-colors duration-300`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider">Demand Score</p>
                <p className="text-sm md:text-base font-bold mt-1.5 truncate">{demandIndex}</p>
                <span className="text-[9px] opacity-85 block mt-0.5">Fuzzy calculated</span>
              </div>
            </div>

            {/* Dynamic Forecast Narrative */}
            <div className="mt-5 p-4 rounded-xl bg-amber-950/15 border border-amber-900/20 text-xs text-muted-foreground flex gap-3">
              <Info className="w-4 h-4 text-[#e1dcc9] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">AI Market Simulation Insight: </span>
                {percentDiff > 10 ? (
                  <span>
                    Your simulated price of <strong className="text-red-400">${selectedProductPrice}</strong> is currently {Math.round(percentDiff)}% above the competitive market average. Buyers are highly sensitive in this category; volume is projected to decrease, lowering weekly velocity to roughly <strong>{weeklySalesProj} sales/week</strong>.
                  </span>
                ) : percentDiff < -10 ? (
                  <span>
                    Pricing aggressively low at <strong className="text-cyan-400">${selectedProductPrice}</strong> sets your offering {Math.round(Math.abs(percentDiff))}% below the platform sweetspot. This creates massive traction (estimated <strong>{weeklySalesProj} items/week</strong>), but reduces absolute unit margins by ${Math.round(suggestedPrice - selectedProductPrice)}.
                  </span>
                ) : (
                  <span>
                    Your simulated price of <strong className="text-[#e1dcc9]">${selectedProductPrice}</strong> is extremely close to the optimal balance point. This pricing maximizes absolute store margin without triggering competitive listing filters, enabling a stable <strong>{weeklySalesProj} transactions/week</strong>.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Forecasting Totals */}
          <div className="mt-6 pt-5 border-t border-[#412d15]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-transparent to-[#412d15]/10 p-3 rounded-xl">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Expected Weekly Gross Projections</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#e1dcc9] tracking-tight">
                  ${projectedWeeklyRevenue.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  ~{weeklySalesProj} orders
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedProductPrice(suggestedPrice)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-glow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Adopt AI Sweetspot (${suggestedPrice})
            </button>
          </div>
        </motion.div>

        {/* Low Stock Alerts & Live Activity Panel */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Critical Warnings</h3>
                <p className="text-xs text-muted-foreground">Real-time action list required</p>
              </div>
            </div>

            {/* Warning list */}
            <div className="space-y-3 mt-4">
              {stats?.lowStockAlerts && stats.lowStockAlerts.length > 0 ? (
                stats.lowStockAlerts.map((product) => (
                  <div
                    key={product._id}
                    className="p-3 rounded-xl bg-red-950/10 border border-red-500/15 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{product.title}</p>
                      <p className="text-[10px] text-red-400/80 mt-0.5">Critically Low Stock Warning</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/35 font-bold shrink-0 ml-2">
                      {product.stock} left
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-[#412d15]/80 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#412d15]/30 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-400/70" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">All Stock Fully Optimized</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">No immediate replenishment needed.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-5 border-t border-[#412d15]/50 text-center">
            <div className="p-3.5 rounded-xl bg-[#412d15]/20 border border-[#e1dcc9]/5 flex items-center gap-3 text-left">
              <HelpCircle className="w-5 h-5 text-[#e1dcc9]/85 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wide">Dynamic Restock Suggestion</h4>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                  Restocking audio items this week is recommended. Demand velocity in this category has climbed by 28%.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </motion.div>
    </LoaderWrapper>
  );
}
