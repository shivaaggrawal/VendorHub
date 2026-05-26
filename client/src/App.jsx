import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./redux/slices/authSlice";
import RootLayout from "./layouts/RootLayout";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import { useDelayedLoader, DelayedSuspenseFallback, GlobalTopBarLoader } from "./lib/loadingUtils";


const LandingPage = lazy(() => import("./pages/LandingPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const SellerDashboard = lazy(() => import("./pages/dashboard/SellerDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const SellersPage = lazy(() => import("./pages/SellersPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function App() {
  const dispatch = useDispatch();
  const isInitializing = useSelector((state) => state.auth.isInitializing);
  const showInitializingLoader = useDelayedLoader(isInitializing, { delay: 300, minimumShowTime: 500 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  if (showInitializingLoader) {
    return <Loader />;
  }

  return (
    <Router>
      <GlobalTopBarLoader />
      <ScrollToTop />
      <Suspense fallback={<DelayedSuspenseFallback text="Calibrating premium boutique elements..." />}>
        <AnimatePresence mode="wait">
          <Routes>

            <Route element={<RootLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/sellers" element={<SellersPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/orders/:id/tracking"
                element={
                  <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>


            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>


            <Route element={<DashboardLayout role="seller" />}>
              <Route path="/seller/dashboard" element={<ProtectedRoute roles={["seller"]}><SellerDashboard view="overview" /></ProtectedRoute>} />
              <Route path="/seller/products" element={<ProtectedRoute roles={["seller"]}><SellerDashboard view="products" /></ProtectedRoute>} />
              <Route path="/seller/orders" element={<ProtectedRoute roles={["seller"]}><SellerDashboard view="orders" /></ProtectedRoute>} />
              <Route path="/seller/analytics" element={<ProtectedRoute roles={["seller"]}><SellerDashboard view="analytics" /></ProtectedRoute>} />
              <Route path="/seller/settings" element={<ProtectedRoute roles={["seller"]}><SellerDashboard view="settings" /></ProtectedRoute>} />
            </Route>

            <Route element={<DashboardLayout role="admin" />}>
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard view="overview" /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute roles={["admin"]}><AdminDashboard view="products" /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminDashboard view="users" /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute roles={["admin"]}><AdminDashboard view="categories" /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute roles={["admin"]}><AdminDashboard view="orders" /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><AdminDashboard view="settings" /></ProtectedRoute>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Router>
  );
}

export default App;
