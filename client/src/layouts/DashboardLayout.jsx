import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  BarChart3,
  Tag,
  Lock,
} from "lucide-react";
import { logout } from "../redux/slices/authSlice";




const sellerNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/seller/dashboard" },
  { label: "Products", icon: Package, to: "/seller/products" },
  { label: "Orders", icon: ShoppingCart, to: "/seller/orders" },
  { label: "Analytics", icon: BarChart3, to: "/seller/analytics" },
  { label: "Settings", icon: Settings, to: "/seller/settings" },
];

const adminNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Categories", icon: Tag, to: "/admin/categories" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];




const Sidebar = ({ navItems, collapsed, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => {});
    dispatch(logout());
    navigate("/");
  };

  return (
    <aside
      className={`flex flex-col h-full bg-card border-r border-border ${
        collapsed && !isMobile ? "w-[68px]" : "w-64"
      } transition-all duration-300`}
    >

      <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-1.5 min-w-0 py-1 select-none">
          {collapsed && !isMobile ? (
            <span className="text-lg font-black tracking-wider font-oswald text-foreground">
              V<span className="gradient-text font-bold">H</span>
            </span>
          ) : (
            <span className="text-lg tracking-[0.15em] font-black uppercase font-oswald text-foreground">
              VENDOR<span className="gradient-text font-bold tracking-[0.08em]">HUB</span>
            </span>
          )}
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>


      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ label, icon: Icon, to }) => {
          const isSellerPending = user?.role === "seller" && !user?.isVendorApproved;
          const isLocked = isSellerPending && to !== "/seller/dashboard";
          const isActive = !isLocked && location.pathname === to;

          if (isLocked) {
            return (
              <div
                key={to}
                title={collapsed && !isMobile ? `${label} (Locked - Awaiting Approval)` : undefined}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground/35 cursor-not-allowed select-none border border-transparent"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-5 h-5 shrink-0 text-muted-foreground/20" />
                  {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
                </div>
                {(!collapsed || isMobile) && <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground/20" />}
              </div>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              onClick={isMobile ? onClose : undefined}
              title={collapsed && !isMobile ? label : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                } transition-colors`}
              />
              {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>


      <div className="px-3 py-4 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed && !isMobile ? "Sign Out" : undefined}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

const DashboardLayout = ({ role = "seller" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const navItems = role === "admin" ? adminNavItems : sellerNavItems;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen flex bg-background">

      <div className="hidden md:flex shrink-0 sticky top-0 h-screen">
        <Sidebar navItems={navItems} collapsed={collapsed} />
      </div>


      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar
                navItems={navItems}
                collapsed={false}
                isMobile
                onClose={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>


      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>


            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden md:flex h-9 w-9 rounded-lg hover:bg-muted items-center justify-center transition-colors"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>

            <div>
              <h2 className="text-sm font-semibold text-foreground capitalize">
                {role} Dashboard
              </h2>
            </div>
          </div>


          <div className="flex items-center gap-2">

            <button
              className="relative h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
            </button>


            <div className="flex items-center gap-2.5 ml-1">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
              )}
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-medium text-foreground truncate leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  {role === "admin" ? "Administrator" : "Seller"}
                </p>
              </div>
            </div>
          </div>
        </header>


        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
