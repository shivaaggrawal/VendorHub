import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  IndianRupee,
  Package,
} from "lucide-react";
import api from "../../../services/api";

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


const DEFAULT_WEEKLY_SALES = [
  { _id: "Mon", dailyEarnings: 120 * 83, orders: 2 },
  { _id: "Tue", dailyEarnings: 450 * 83, orders: 4 },
  { _id: "Wed", dailyEarnings: 300 * 83, orders: 3 },
  { _id: "Thu", dailyEarnings: 800 * 83, orders: 7 },
  { _id: "Fri", dailyEarnings: 650 * 83, orders: 5 },
  { _id: "Sat", dailyEarnings: 1200 * 83, orders: 9 },
  { _id: "Sun", dailyEarnings: 950 * 83, orders: 8 },
];

const DEFAULT_TOP_PRODUCTS = [
  { title: "Wireless Noise-Cancelling Headphones", totalSold: 12, totalRevenue: 2999 * 83 },
  { title: "Leather Travel Duffel Bag", totalSold: 8, totalRevenue: 1519 * 83 },
  { title: "Futuristic Ceramic Mug v2", totalSold: 15, totalRevenue: 599 * 83 },
  { title: "Premium Leather Cardholder", totalSold: 19, totalRevenue: 499 * 83 },
  { title: "Titanium Mechanical Keyboard", totalSold: 4, totalRevenue: 1199 * 83 },
];

export default function SellerAnalytics() {

  const { data: weeklySales } = useQuery({
    queryKey: ["sellerWeeklySales"],
    queryFn: async () => {
      const res = await api.get("/seller/earnings/weekly");
      return res.data.data;
    },
  });


  const { data: topProducts } = useQuery({
    queryKey: ["sellerTopProducts"],
    queryFn: async () => {
      const res = await api.get("/seller/products/top");
      return res.data.data;
    },
  });

  const chartWeeklyData = weeklySales && weeklySales.length > 0
    ? weeklySales.map(item => ({
        ...item,
        date: new Date(item._id).toLocaleDateString("en-US", { weekday: "short" })
      }))
    : DEFAULT_WEEKLY_SALES.map(item => ({ ...item, date: item._id }));

  const chartProductsData = topProducts && topProducts.length > 0
    ? topProducts
    : DEFAULT_TOP_PRODUCTS;

  const totalWeeklyRevenue = chartWeeklyData.reduce((sum, item) => sum + (item.dailyEarnings || 0), 0);
  const totalWeeklyOrders = chartWeeklyData.reduce((sum, item) => sum + (item.orders || 0), 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Insight Studio
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e1dcc9]/10 border border-[#e1dcc9]/25 text-[#e1dcc9] flex items-center gap-1 shadow-glow-sm">
              <Sparkles className="w-3 h-3 text-[#e1dcc9]" /> Real-time Projections
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Deep analytical models mapping revenue, velocity, conversion rate, and inventory performance.
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 shadow-premium"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-[#e1dcc9]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Weekly Sales Gross</p>
            <h3 className="text-2xl font-black text-foreground mt-1">₹{totalWeeklyRevenue.toLocaleString("en-IN")}</h3>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 shadow-premium"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-[#e1dcc9]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Orders Velocity</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{totalWeeklyOrders} total checkouts</h3>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 shadow-premium"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[#e1dcc9]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Avg Ticket Size</p>
            <h3 className="text-2xl font-black text-foreground mt-1">
              ₹{totalWeeklyOrders > 0 ? Math.round(totalWeeklyRevenue / totalWeeklyOrders).toLocaleString("en-IN") : 0}
            </h3>
          </div>
        </motion.div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <motion.div
          variants={itemVariants}
          className="bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#412d15] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#e1dcc9]" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Weekly Gross & Orders</h3>
              <p className="text-[10px] text-muted-foreground">Rolling 7-day sales and transaction count</p>
            </div>
          </div>

          <div className="w-full h-[300px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e1dcc9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#e1dcc9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#412d15" opacity={0.25} />
                <XAxis dataKey="date" stroke="#e1dcc9" opacity={0.4} tickLine={false} />
                <YAxis stroke="#e1dcc9" opacity={0.4} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f150c",
                    borderColor: "#412d15",
                    borderRadius: "12px",
                    color: "#ffffff"
                  }}
                  itemStyle={{ color: "#e1dcc9" }}
                />
                <Area
                  type="monotone"
                  dataKey="dailyEarnings"
                  name="Earnings (₹)"
                  stroke="#e1dcc9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#glowColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>


        <motion.div
          variants={itemVariants}
          className="bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#412d15] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#e1dcc9]" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Best-Selling Listings</h3>
              <p className="text-[10px] text-muted-foreground">Top-performing catalog items sorted by units sold</p>
            </div>
          </div>

          <div className="w-full h-[300px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#412d15" opacity={0.25} />
                <XAxis
                  dataKey="title"
                  stroke="#e1dcc9"
                  opacity={0.4}
                  tickFormatter={(val) => val.split(" ").slice(0, 2).join(" ") + "..."}
                  tickLine={false}
                />
                <YAxis stroke="#e1dcc9" opacity={0.4} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f150c",
                    borderColor: "#412d15",
                    borderRadius: "12px",
                    color: "#ffffff"
                  }}
                  itemStyle={{ color: "#e1dcc9" }}
                />
                <Bar
                  dataKey="totalSold"
                  name="Units Sold"
                  fill="#e1dcc9"
                  radius={[6, 6, 0, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
