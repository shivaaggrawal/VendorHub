import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";





export default function QueryErrorPlaceholder({
  error,
  refetch,
  message = "Failed to synchronize resource data elements.",
}) {
  const diagnosticMsg =
    error?.response?.data?.message ||
    error?.message ||
    "Server returned invalid status response.";

  return (
    <div className="w-full p-5 rounded-2xl bg-[#140606]/40 border border-red-500/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md shadow-premium">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-400/80">
            Platform Synchronization Exception
          </p>
          <p className="text-xs font-semibold text-[#e1dcc9]">{message}</p>
          <p className="text-[10px] font-mono text-[#e1dcc9]/40 leading-relaxed break-all">
            Trace: {diagnosticMsg}
          </p>
        </div>
      </div>
      {refetch && (
        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-950/10 hover:bg-red-500/15 active:scale-[0.98] text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Sync
        </button>
      )}
    </div>
  );
}
