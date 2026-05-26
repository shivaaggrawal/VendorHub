import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Activity } from "lucide-react";
import api from "../services/api";
import CountdownWatch from "../components/CountdownWatch";




const GlobeGrid = () => (
  <svg
    viewBox="0 0 800 800"
    className="absolute -right-32 -bottom-32 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] text-[#e1dcc9]/5 opacity-[0.08] pointer-events-none animate-[spin_180s_linear_infinite]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="400" cy="400" r="100" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="400" cy="400" r="200" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="400" cy="400" r="300" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="6 6" />
    <circle cx="400" cy="400" r="380" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="400" y1="0" x2="400" y2="800" stroke="currentColor" strokeWidth="1" />
    <line x1="0" y1="400" x2="800" y2="400" stroke="currentColor" strokeWidth="1" />
    <line x1="117" y1="117" x2="683" y2="683" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="117" y1="683" x2="683" y2="117" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
  </svg>
);

const DottedPath = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <path
      id="motionPath"
      d="M -80 320 Q 200 160, 420 300 T 920 220"
      fill="none"
      stroke="url(#pathGrad)"
      strokeWidth="2"
      strokeDasharray="6 8"
      className="animate-[stroke-move_16s_linear_infinite]"
    />
    <defs>
      <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#412d15" stopOpacity="0.05" />
        <stop offset="35%" stopColor="#e1dcc9" stopOpacity="0.35" />
        <stop offset="65%" stopColor="#e1dcc9" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#412d15" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes stroke-move {
        from { stroke-dashoffset: 0; }
        to { stroke-dashoffset: 140; }
      }
    `}</style>
  </svg>
);

const FloatingParticles = () => {
  const particles = Array.from({ length: 16 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const size = Math.random() * 4 + 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#e1dcc9]/20 shadow-[0_0_8px_rgba(225,220,201,0.3)]"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 9 + Math.random() * 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        );
      })}
    </div>
  );
};

const LuxuryCart = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-28 h-28 sm:w-36 sm:h-36 text-[#e1dcc9] drop-shadow-[0_0_30px_rgba(225,220,201,0.22)]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >

    <path d="M22 26 h56 l-8 36 h-40 l-8 -36 Z" strokeWidth="1.75" />

    <path d="M12 16 h10 l8 36 h46" />

    <circle cx="34" cy="76" r="6" fill="#e1dcc9" />
    <circle cx="66" cy="76" r="6" fill="#e1dcc9" />
    <circle cx="34" cy="76" r="2" fill="#000000" />
    <circle cx="66" cy="76" r="2" fill="#000000" />

    <path d="M31 26 l4 36" opacity="0.25" />
    <path d="M41 26 l3 36" opacity="0.25" />
    <path d="M50 26 l1 36" opacity="0.25" />
    <path d="M59 26 l-2 36" opacity="0.25" />
    <path d="M68 26 l-5 36" opacity="0.25" />
    <path d="M23 38 h54" opacity="0.25" />
    <path d="M25 50 h50" opacity="0.25" />

    <circle cx="50" cy="44" r="10" fill="url(#coreGlow)" className="animate-pulse" />
    <defs>
      <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#e1dcc9" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#412d15" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  const [timerSettings, setTimerSettings] = useState({
    expiresAt: new Date(Date.now() + 80 * 60 * 60 * 1000).toISOString(),
    hours: 80,
  });

  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const response = await api.get("/settings/timer");
        const data = response.data?.data;
        if (data?.expiresAt) {
          setTimerSettings(data);
        }
      } catch (err) {
        console.error("Error fetching timer settings in AuthLayout:", err);
      }
    };
    fetchTimer();
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#000000] text-[#f5f5f5] overflow-x-hidden font-sans relative">


      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(65,45,21,0.18),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(31,21,12,0.4),transparent_50%)] pointer-events-none z-0" />


      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] relative overflow-hidden bg-gradient-to-br from-black via-[#0c0906] to-black lg:border-r border-[#412d15]/30 lg:p-16 flex-col justify-between lg:min-h-screen z-10">


        <style>{`
          @keyframes slow-pan {
            0% { transform: scale(1.05) translate(0px, 0px); }
            50% { transform: scale(1.12) translate(-8px, -4px); }
            100% { transform: scale(1.05) translate(0px, 0px); }
          }
        `}</style>


        <div className="absolute inset-0 z-0 opacity-[0.16] mix-blend-luminosity filter contrast-[1.2] brightness-[0.7] pointer-events-none overflow-hidden">
          <img
            src="/auth-bg.png"
            alt="Luxury apparel preview"
            className="w-full h-full object-cover scale-105"
            style={{ animation: "slow-pan 22s ease-in-out infinite alternate" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/55 z-0 pointer-events-none" />


        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,220,201,0.02),transparent_60%)] pointer-events-none z-0" />


        <GlobeGrid />
        <DottedPath />
        <FloatingParticles />


        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-[0.2em] text-[#e1dcc9]">
              VENDOR<span className="font-light tracking-[0.08em] text-[#e1dcc9]/70">HUB</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#e1dcc9]/10 bg-black/40 px-3.5 py-1 text-[9px] uppercase tracking-[0.25em] text-[#e1dcc9]/85 backdrop-blur-md">
            <Activity className="w-3 h-3 text-[#e1dcc9] animate-pulse" />
            AI SECURE GATEWAY
          </span>
        </div>


        <div className="my-auto py-12 flex items-center justify-center relative min-h-[160px] sm:min-h-[220px]">

          <div className="absolute w-44 h-44 bg-[#412d15]/15 rounded-full blur-[80px] pointer-events-none" />

          <motion.div
            className="relative z-10"
            animate={{
              x: isLogin ? -70 : 70,
              y: isLogin ? 10 : -10,
              rotate: isLogin ? -2 : 3,
            }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 15,
              mass: 1.2,
            }}
          >

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <LuxuryCart />
            </motion.div>
          </motion.div>
        </div>


        <div className="relative z-10 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-[#e1dcc9] mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#e1dcc9]/80">
                Curated AI Commerce
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-oswald leading-none">
              Shop Smarter <br className="hidden sm:inline" />
              With <span className="gradient-text">AI Intelligence</span>
            </h1>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#e1dcc9]/60 font-light">
              Experience the future of multi-vendor drops, real-time bid synchronizations, and luxury fashion technology at your fingertips.
            </p>

          </div>
        </div>
      </div>


      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 sm:py-10 lg:py-16 z-10 bg-gradient-to-t from-black via-black/95 to-[#050403] relative min-h-screen">


        <div className="absolute inset-0 z-0 lg:hidden opacity-[0.05] mix-blend-luminosity pointer-events-none overflow-hidden">
          <img
            src="/auth-bg.png"
            alt="Background underlay"
            className="w-full h-full object-cover blur-[2px]"
          />
        </div>


        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f150c_1px,transparent_1px),linear-gradient(to_bottom,#1f150c_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_40%,transparent_100%)] opacity-[0.15] pointer-events-none" />


        <div className="absolute top-1/4 right-1/4 w-[380px] h-[380px] bg-[#412d15]/10 rounded-full blur-[110px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-[#e1dcc9]/3 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] bg-[radial-gradient(circle,rgba(65,45,21,0.09)_0%,rgba(225,220,201,0.03)_50%,transparent_100%)] rounded-full blur-[90px] pointer-events-none" />

        <div className="w-full max-w-md sm:max-w-[460px] md:max-w-[480px] lg:max-w-[500px] xl:max-w-[530px] relative z-10 px-2">

          <div className="lg:hidden flex justify-center mb-5">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-[0.25em] text-[#e1dcc9] font-oswald">
                VENDOR<span className="font-light tracking-[0.1em] text-[#e1dcc9]/70">HUB</span>
              </span>
            </Link>
          </div>


          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: isLogin ? 20 : -20, y: 5 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isLogin ? -20 : 20, y: -5 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
