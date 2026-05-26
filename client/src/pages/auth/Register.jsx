import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { register, clearError } from "../../redux/slices/authSlice";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);

  useEffect(() => {
    if (localError) setLocalError("");
    dispatch(clearError());
  }, [name, email, password, role, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasMinLength) {
      setLocalError("Your password must be at least 6 characters in length.");
      return;
    }
    if (!hasNumber) {
      setLocalError("Your password must contain at least one numerical digit (0-9).");
      return;
    }
    setLocalError("");
    const result = await dispatch(register({ name, email, password, role }));
    if (register.fulfilled.match(result)) {
      navigate(role === "seller" ? "/seller/dashboard" : "/");
    }
  };

  return (
    <div className="w-full">

      <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] border border-[#e1dcc9]/10 bg-[#1f150c]/25 p-5 sm:p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-3xl">


        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#e1dcc9]/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#412d15]/20 rounded-full blur-3xl pointer-events-none" />


        <div className="text-center mb-5 sm:mb-8 relative z-10">
          <span className="inline-flex rounded-full border border-[#e1dcc9]/12 bg-[#e1dcc9]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[#e1dcc9]/85 mb-2.5 sm:mb-3 font-semibold">
            Gateway Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-oswald leading-none">
            Create Account
          </h2>
          <p className="text-xs text-[#e1dcc9]/50 mt-1.5 sm:mt-2 font-light">
            Register your secure profile to begin your journey
          </p>
        </div>


        {(localError || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-[#412d15]/40 border border-[#e1dcc9]/12 text-[#e1dcc9] text-xs rounded-2xl px-4 py-3.5 mb-5 sm:mb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#e1dcc9]/80" />
            <div className="space-y-1">
              <p className="font-semibold tracking-wider uppercase text-[9px]">Registration Error</p>
              <p className="text-[#e1dcc9]/70 leading-relaxed font-light">{localError || error}</p>
            </div>
          </motion.div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">


          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/60">
              Select Profile Role
            </label>
            <div className="flex bg-black/55 rounded-2xl p-1 gap-1 border border-[#412d15]/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`flex-1 text-[10px] uppercase tracking-[0.18em] font-black py-2.5 rounded-xl transition-all duration-300 ${
                  role === "buyer"
                    ? "bg-[#e1dcc9] text-black shadow-lg"
                    : "text-[#e1dcc9]/50 hover:text-[#e1dcc9] hover:bg-[#412d15]/20"
                }`}
              >
                Buy Products
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`flex-1 text-[10px] uppercase tracking-[0.18em] font-black py-2.5 rounded-xl transition-all duration-300 ${
                  role === "seller"
                    ? "bg-[#e1dcc9] text-black shadow-lg"
                    : "text-[#e1dcc9]/50 hover:text-[#e1dcc9] hover:bg-[#412d15]/20"
                }`}
              >
                Sell Products
              </button>
            </div>
          </div>


          <div className="space-y-1.5 group relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors duration-200">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/35 group-focus-within:text-[#e1dcc9]/80 transition-colors duration-200" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/40 text-sm text-[#f5f5f5] placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 focus:bg-black/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300"
                autoComplete="name"
              />
            </div>
          </div>


          <div className="space-y-1.5 group relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors duration-200">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/35 group-focus-within:text-[#e1dcc9]/80 transition-colors duration-200" />
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/40 text-sm text-[#f5f5f5] placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 focus:bg-black/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300"
                autoComplete="email"
              />
            </div>
          </div>


          <div className="space-y-1.5 group relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors duration-200">
              Create Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/35 group-focus-within:text-[#e1dcc9]/80 transition-colors duration-200" />
              <input
                type="password"
                placeholder="Minimum 6 characters with a number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/40 text-sm text-[#f5f5f5] placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 focus:bg-black/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300"
                autoComplete="new-password"
              />
            </div>


            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1.5 px-1 py-0.5 mt-1"
              >
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${hasMinLength ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400"}`} />
                  <span className={hasMinLength ? "text-emerald-400/90 font-medium" : "text-[#e1dcc9]/50"}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${hasNumber ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400"}`} />
                  <span className={hasNumber ? "text-emerald-400/90 font-medium" : "text-[#e1dcc9]/50"}>
                    Contains at least one number
                  </span>
                </div>
              </motion.div>
            )}
          </div>


          <AnimatePresence>
            {role === "seller" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 5 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 5 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 bg-[#412d15]/30 border border-[#e1dcc9]/10 text-[#e1dcc9]/90 text-[11px] rounded-2xl px-4 py-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)]">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#e1dcc9]/70" />
                  <p className="leading-relaxed font-light">
                    Seller registrations are subject to admin review. You will be activated once your credentials have been verified.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


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
                Registering...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Initiate Account
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
              </span>
            )}
          </Button>
        </form>
      </div>


      <div className="text-center mt-6">
        <p className="text-xs text-[#e1dcc9]/45 font-light">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#e1dcc9]/80 hover:text-white transition-colors underline underline-offset-4 decoration-[#e1dcc9]/20 hover:decoration-white/80"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
