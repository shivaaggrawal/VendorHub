import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Shield, Store, MapPin, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { updateProfile } from "../../../redux/slices/authSlice";
import { useToast } from "../../../components/ui/toast";

export default function SellerSettings() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, status } = useSelector((state) => state.auth);
  const [storeName, setStoreName] = useState(user?.storeName || "");
  const [location, setLocation] = useState(user?.vendorLocation || "");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!storeName.trim() || !location.trim()) {
      toast.error("Store name and shipping hub location cannot be blank.");
      return;
    }

    try {
      setLoading(true);
      await dispatch(updateProfile({ storeName, vendorLocation: location })).unwrap();
      setSuccess(true);
      toast.success("Merchant profile credentials updated successfully!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err || "Failed to save storefront configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Store Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your store identity, profile credentials, and checkout security settings.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> Changes saved successfully!
        </div>
      )}


      <div className="bg-[#1f150c]/30 backdrop-blur-xl border border-[#412d15]/50 rounded-2xl p-6 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-muted-foreground" /> Store Identity
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-[#e1dcc9]/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Shipping Hub Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-[#e1dcc9]/50 transition-colors"
            />
          </div>

          <div className="p-4 rounded-xl bg-black/35 border border-[#412d15]/50 text-xs space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-1">
              <Shield className="w-4 h-4 text-[#e1dcc9]" /> Cryptographic Seller Token
            </h4>
            <p className="text-[10px] text-muted-foreground">
              Your profile is verified and protected under Web3 transaction logs. No actions are required.
            </p>
            <span className="text-[9px] text-[#e1dcc9] font-bold bg-[#e1dcc9]/10 px-2 py-0.5 border border-[#e1dcc9]/25 rounded block w-fit mt-1">
              Status: SECURE & VERIFIED
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] disabled:opacity-50 active:scale-[0.98] transition-all font-bold text-xs flex items-center gap-1.5 shadow-glow-sm"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Save store changes
          </button>
        </form>
      </div>
    </div>
  );
}
