import { motion } from "framer-motion";






const Loader = ({
  fullScreen = true,
  text = "Synchronizing intelligence layers...",
  subtitle = "SECURE CORE GATEWAY"
}) => {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden relative ${
        fullScreen
          ? "h-screen w-full bg-black"
          : "h-[50vh] w-full rounded-[2.5rem] border border-[#e1dcc9]/10 bg-[#1f150c]/5 backdrop-blur-sm"
      }`}
    >

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#412d15]/40 rounded-full blur-[110px] animate-pulse pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#e1dcc9]/3 rounded-full blur-[80px] animate-pulse pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="flex flex-col items-center gap-8 relative z-10">

        <div className="relative flex items-center justify-center w-48 h-48">
          <div className="absolute inset-0 border border-dashed border-[#e1dcc9]/10 rounded-full animate-[spin_30s_linear_infinite]" />
          <div className="absolute w-40 h-40 border border-dashed border-[#412d15]/70 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute w-32 h-32 border border-[#e1dcc9]/5 rounded-full" />


          <div className="relative flex items-center justify-center font-black select-none">
            <span className="text-3xl tracking-widest text-[#e1dcc9] font-anton opacity-95 relative leading-none">
              VENDOR
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black text-[#e1dcc9] text-xs font-black px-2 py-0.5 rounded-full border border-[#e1dcc9]/40 shadow-[0_0_18px_rgba(225,220,201,0.22)] tracking-normal font-sans scale-90 translate-y-[1px]">
                  HUB
                </span>
              </span>
            </span>
          </div>
        </div>


        <div className="flex flex-col items-center gap-2">
          {subtitle && (
            <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-[#e1dcc9]/60 font-oswald">
              {subtitle}
            </h2>
          )}
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#e1dcc9]/40 to-transparent relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-8 bg-[#e1dcc9]/80 animate-[marquee_2s_ease-in-out_infinite]" />
          </div>
          <p className="text-[9px] sm:text-[10px] text-[#e1dcc9]/40 tracking-wider font-light animate-pulse mt-1 text-center px-4">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
