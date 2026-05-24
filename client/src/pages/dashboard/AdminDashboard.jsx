import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { DelayedSuspenseFallback } from "../../lib/loadingUtils";

// Lazy-loaded subcomponents for code separation & performance
const AdminOverview = lazy(() => import("./admin/AdminOverview"));
const AdminProducts = lazy(() => import("./admin/AdminProducts"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AdminCategories = lazy(() => import("./admin/AdminCategories"));
const AdminOrders = lazy(() => import("./admin/AdminOrders"));
const AdminSettings = lazy(() => import("./admin/AdminSettings"));

const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
};

export default function AdminDashboard({ view = "overview" }) {
  const renderView = () => {
    switch (view) {
      case "overview":
        return <AdminOverview />;
      case "products":
        return <AdminProducts />;
      case "users":
        return <AdminUsers />;
      case "categories":
        return <AdminCategories />;
      case "orders":
        return <AdminOrders />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 max-w-7xl">
      <Suspense
        fallback={
          <DelayedSuspenseFallback text="Loading secure admin console..." fullScreen={false} />
        }
      >
        <motion.div
          key={view}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderView()}
        </motion.div>
      </Suspense>
    </div>
  );
}
