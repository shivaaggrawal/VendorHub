import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Shield, Percent, CheckCircle, Sparkles } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../components/ui/toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [commissionRate, setCommissionRate] = useState(10);
  const [success, setSuccess] = useState(false);

  // Update commission mutation
  const updateCommissionMutation = useMutation({
    mutationFn: async (rate) => {
      const res = await api.patch("/admin/settings/commission", { rate });
      return res.data.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success("Platform parameters updated successfully!");
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update commission rate.");
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateCommissionMutation.mutate(commissionRate);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Platform Parameters
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Adjust global commissions, configure security layers, and fine-tune AI recommendations criteria.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> Platform parameters updated successfully!
        </div>
      )}

      {/* Commission settings panel */}
      <div className="bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Percent className="w-4 h-4 text-[#e1dcc9]" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Marketplace Commission Split</h3>
              <p className="text-[10px] text-muted-foreground">Adjust global platform fee deducted from vendor earnings</p>
            </div>
          </div>

          {/* Interactive slider */}
          <div className="space-y-3 p-4 rounded-xl bg-black/35 border border-[#412d15]/50">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Global Commission Split</span>
              <span className="text-[#e1dcc9] font-bold text-sm bg-[#e1dcc9]/10 px-2 py-0.5 border border-[#e1dcc9]/20 rounded">
                {commissionRate}% Platform Fee
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#e1dcc9] outline-none"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0% (Free listing)</span>
              <span>20% (Standard)</span>
              <span>40% (Max Limit)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-[#e1dcc9]/5 text-xs space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#e1dcc9]" /> Platform Integrity Shield
            </h4>
            <p className="text-[10px] text-muted-foreground">
              Adjusting commission splits triggers cryptographic verification logs sent dynamically to all active vendors.
            </p>
          </div>

          <button
            type="submit"
            disabled={updateCommissionMutation.isPending}
            className="px-4 py-2.5 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] disabled:opacity-50 active:scale-[0.98] transition-all font-bold text-xs flex items-center gap-1.5 shadow-glow-sm"
          >
            {updateCommissionMutation.isPending ? (
              <div className="w-3.5 h-3.5 border-t-2 border-black border-solid rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Authorizesplit changes
          </button>
        </form>
      </div>
    </div>
  );
}
