import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

const pad = (value) => String(value).padStart(2, "0");

const CountdownWatch = ({ expiresAt }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return diff;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const timeParts = useMemo(() => {
    const seconds = remainingSeconds;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { days, hours, minutes, secs };
  }, [remainingSeconds]);

  return (
    <div className="mt-6 rounded-[2rem] border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1f150c]/25 via-black/45 to-[#0c0906]/60 p-5 sm:p-6 shadow-[0_24px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-white relative overflow-hidden group">

      <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#e1dcc9]/3 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#412d15]/15 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#e1dcc9]/12 to-[#412d15]/20 text-[#e1dcc9] border border-[#e1dcc9]/15 shadow-[0_0_12px_rgba(225,220,201,0.1)]">
          <Clock className="h-5 w-5 animate-[spin_40s_linear_infinite]" />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#e1dcc9]/70">Live Secure Drop</p>
          <p className="text-xs font-semibold tracking-wide text-white/90">Exclusive AI Multi-Vendor Auction Closes In</p>
        </div>
      </div>


      <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3 relative z-10">


        <div className="rounded-2xl border border-[#e1dcc9]/8 bg-black/45 p-3 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)] hover:border-[#e1dcc9]/25 transition-colors duration-300">
          <p className="text-xl sm:text-2xl font-black tracking-tight text-white font-oswald">{pad(timeParts.days)}</p>
          <span className="text-[8px] uppercase tracking-[0.2em] font-medium text-[#e1dcc9]/50 block mt-0.5">Days</span>
        </div>


        <div className="rounded-2xl border border-[#e1dcc9]/8 bg-black/45 p-3 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)] hover:border-[#e1dcc9]/25 transition-colors duration-300">
          <p className="text-xl sm:text-2xl font-black tracking-tight text-white font-oswald">{pad(timeParts.hours)}</p>
          <span className="text-[8px] uppercase tracking-[0.2em] font-medium text-[#e1dcc9]/50 block mt-0.5">Hrs</span>
        </div>


        <div className="rounded-2xl border border-[#e1dcc9]/8 bg-black/45 p-3 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)] hover:border-[#e1dcc9]/25 transition-colors duration-300">
          <p className="text-xl sm:text-2xl font-black tracking-tight text-white font-oswald">{pad(timeParts.minutes)}</p>
          <span className="text-[8px] uppercase tracking-[0.2em] font-medium text-[#e1dcc9]/50 block mt-0.5">Mins</span>
        </div>


        <div className="rounded-2xl border border-[#e1dcc9]/10 bg-[#412d15]/15 p-3 text-center shadow-[0_0_10px_rgba(65,45,21,0.22)] hover:border-[#e1dcc9]/30 transition-colors duration-300 relative group/sec">
          <div className="absolute inset-0 bg-[#e1dcc9]/2 rounded-2xl opacity-0 group-hover/sec:opacity-100 transition-opacity duration-300" />
          <p className="text-xl sm:text-2xl font-black tracking-tight text-[#e1dcc9] font-oswald animate-pulse">{pad(timeParts.secs)}</p>
          <span className="text-[8px] uppercase tracking-[0.2em] font-semibold text-[#e1dcc9]/60 block mt-0.5">Secs</span>
        </div>

      </div>
    </div>
  );
};

export default CountdownWatch;
