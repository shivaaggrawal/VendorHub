import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { login, clearError } from "../../redux/slices/authSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { status, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(clearError());
  }, [email, password, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get("redirect");
      if (redirect) {
        navigate(redirect);
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      const loggedInUser = result.payload.user;
      const redirect = searchParams.get("redirect");
      if (redirect) {
        navigate(redirect);
      } else if (loggedInUser?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (loggedInUser?.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="w-full">

      <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] border border-[#e1dcc9]/10 bg-[#1f150c]/25 p-5 sm:p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-3xl">


        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#e1dcc9]/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#412d15]/20 rounded-full blur-3xl pointer-events-none" />


        <div className="text-center mb-5 sm:mb-8 relative z-10">
          <span className="inline-flex rounded-full border border-[#e1dcc9]/12 bg-[#e1dcc9]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[#e1dcc9]/85 mb-2.5 sm:mb-3 font-semibold">
            Member Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-oswald leading-none">
            Welcome Back
          </h2>
          <p className="text-xs text-[#e1dcc9]/50 mt-1.5 sm:mt-2 font-light">
            Authenticate your secure core layer to enter VendorHub
          </p>
        </div>


        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-[#412d15]/40 border border-[#e1dcc9]/12 text-[#e1dcc9] text-xs rounded-2xl px-4 py-3.5 mb-5 sm:mb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#e1dcc9]/80" />
            <div className="space-y-1">
              <p className="font-semibold tracking-wider uppercase text-[9px]">Authorization Error</p>
              <p className="text-[#e1dcc9]/70 leading-relaxed font-light">{error}</p>
            </div>
          </motion.div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">


          <div className="space-y-1.5 group relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors duration-200">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/35 group-focus-within:text-[#e1dcc9]/80 transition-colors duration-200" />
              <input
                type="email"
                placeholder="user@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/40 text-sm text-[#f5f5f5] placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 focus:bg-black/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300"
                autoComplete="email"
              />
            </div>
          </div>


          <div className="space-y-1.5 group relative">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors duration-200">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] font-semibold text-[#e1dcc9]/45 hover:text-[#e1dcc9]/85 transition-colors uppercase tracking-[0.1em]"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/35 group-focus-within:text-[#e1dcc9]/80 transition-colors duration-200" />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/40 text-sm text-[#f5f5f5] placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 focus:bg-black/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300"
                autoComplete="current-password"
              />
            </div>
          </div>


          <Button
            type="submit"
            variant="premium"
            size="lg"
            className="w-full h-12 rounded-xl tracking-[0.2em] font-black uppercase text-xs shadow-[0_12px_36px_rgba(65,45,21,0.35)] relative overflow-hidden group/btn hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Authorizing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Verify Identity
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
              </span>
            )}
          </Button>
        </form>
      </div>


      <div className="text-center mt-6">
        <p className="text-xs text-[#e1dcc9]/45 font-light">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-[#e1dcc9]/80 hover:text-white transition-colors underline underline-offset-4 decoration-[#e1dcc9]/20 hover:decoration-white/80"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
