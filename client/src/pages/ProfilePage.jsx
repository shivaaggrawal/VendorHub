import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Check,
  Save,
  X,
  AlertCircle,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Heart,
  ShoppingBag,
  Store,
  Map,
  Eye,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Terminal,
  Activity,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import { updateProfile } from "../redux/slices/authSlice";
import api from "../services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};


const MUMBAI_LOCATIONS = [
  "Colaba, Mumbai",
  "Andheri, Mumbai",
  "Bandra, Mumbai",
  "Powai, Mumbai",
  "Juhu, Mumbai",
  "Dadar, Mumbai",
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, status } = useSelector((state) => state.auth);


  const [activeTab, setActiveTab] = useState("identity");


  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);


  const [storeName, setStoreName] = useState(user?.storeName || "");
  const [storeDescription, setStoreDescription] = useState(user?.storeDescription || "");
  const [vendorLocation, setVendorLocation] = useState(user?.vendorLocation || MUMBAI_LOCATIONS[0]);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);


  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);


  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);


  const [sellersList, setSellersList] = useState([]);
  const [isFetchingSellers, setIsFetchingSellers] = useState(false);
  const [sellersSearchQuery, setSellersSearchQuery] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isUpdatingSellerStatus, setIsUpdatingSellerStatus] = useState(false);


  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeApplied, setUpgradeApplied] = useState(false);


  const fetchSellers = async () => {
    if (user?.role !== "admin") return;
    setIsFetchingSellers(true);
    try {
      const response = await api.get("/admin/users?role=seller&limit=100");
      const list = response.data?.data || response.data?.users || [];
      setSellersList(list);
    } catch (err) {
      console.error("Failed to load merchants list", err);
      toast.error("Unable to load platform merchant directory.");
    } finally {
      setIsFetchingSellers(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSellers();
    }
  }, [user]);


  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setStoreName(user.storeName || "");
      setStoreDescription(user.storeDescription || "");
      setVendorLocation(user.vendorLocation || MUMBAI_LOCATIONS[0]);
    }
  }, [user]);


  const getInitials = (name) => {
    if (!name) return "VH";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };


  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error("Name and Email are required fields.");
      return;
    }
    setIsSavingProfile(true);
    try {
      const result = await dispatch(updateProfile({ name: profileName, email: profileEmail }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Identity profile updated successfully.");
        setIsEditingProfile(false);
      } else {
        toast.error(result.payload || "Failed to update profile details.");
      }
    } catch (err) {
      toast.error("A network error occurred while updating profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };


  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim() || !vendorLocation.trim()) {
      toast.error("Store Name and Location are required.");
      return;
    }
    setIsSavingStore(true);
    try {
      const result = await dispatch(
        updateProfile({
          storeName: storeName.trim(),
          storeDescription: storeDescription.trim(),
          vendorLocation: vendorLocation,
        })
      );
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Storefront configurations updated successfully.");
        setIsEditingStore(false);
      } else {
        toast.error(result.payload || "Failed to update storefront details.");
      }
    } catch (err) {
      toast.error("Network error while updating storefront settings.");
    } finally {
      setIsSavingStore(false);
    }
  };


  const saveAddressesToDB = async (updatedAddresses) => {
    try {
      const result = await dispatch(updateProfile({ addresses: updatedAddresses }));
      if (updateProfile.fulfilled.match(result)) {
        return true;
      } else {
        toast.error(result.payload || "Failed to save address changes.");
        return false;
      }
    } catch (err) {
      toast.error("Network error saving addresses.");
      return false;
    }
  };


  const openAddAddress = () => {
    setEditingAddressId(null);
    setStreet("");
    setCity("");
    setStateName("");
    setPincode("");
    setCountry("India");
    setIsDefault(user?.addresses?.length === 0);
    setIsAddressFormOpen(true);
  };


  const openEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setStreet(addr.street);
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setCountry(addr.country || "India");
    setIsDefault(addr.isDefault || false);
    setIsAddressFormOpen(true);
  };


  const closeAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
  };


  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      toast.error("All address fields are required.");
      return;
    }

    setIsSavingAddress(true);
    let currentAddresses = user?.addresses ? [...user.addresses] : [];


    if (isDefault) {
      currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const addressPayload = {
      street: street.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      country: country.trim(),
      isDefault: isDefault,
    };

    if (editingAddressId) {

      currentAddresses = currentAddresses.map((addr) =>
        addr._id === editingAddressId ? { ...addr, ...addressPayload } : addr
      );
    } else {

      currentAddresses.push(addressPayload);
    }


    const success = await saveAddressesToDB(currentAddresses);
    setIsSavingAddress(false);

    if (success) {
      toast.success(
        editingAddressId
          ? "Address profile updated successfully."
          : "New delivery terminal address added successfully."
      );
      closeAddressForm();
    }
  };


  const handleDeleteAddress = async (addrId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this delivery terminal address?");
    if (!confirmDelete) return;

    const currentAddresses = user?.addresses ? [...user.addresses] : [];
    const targetAddress = currentAddresses.find((a) => a._id === addrId);
    let updatedAddresses = currentAddresses.filter((addr) => addr._id !== addrId);


    if (targetAddress?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    toast.info("Deleting address terminal...");
    const success = await saveAddressesToDB(updatedAddresses);
    if (success) {
      toast.success("Delivery address de-registered.");
    }
  };


  const handleSetDefaultAddress = async (addrId) => {
    let currentAddresses = user?.addresses ? [...user.addresses] : [];
    currentAddresses = currentAddresses.map((a) => ({
      ...a,
      isDefault: a._id === addrId,
    }));

    toast.info("Updating default terminal...");
    const success = await saveAddressesToDB(currentAddresses);
    if (success) {
      toast.success("Primary delivery destination set.");
    }
  };


  const handleToggleSellerActive = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      const response = await api.patch(`/admin/users/${sellerId}/toggle-active`);
      const updatedStatus = response.data?.data?.isActive;


      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isActive: updatedStatus } : s))
      );


      if (selectedSeller?._id === sellerId) {
        setSelectedSeller((prev) => ({ ...prev, isActive: updatedStatus }));
      }

      toast.success(`Merchant account ${updatedStatus ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to alter merchant status.");
    } finally {
      setIsUpdatingSellerStatus(false);
    }
  };


  const handleApproveSeller = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      await api.patch(`/admin/vendors/${sellerId}/approve`);


      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isVendorApproved: true } : s))
      );


      if (selectedSeller?._id === sellerId) {
        setSelectedSeller((prev) => ({ ...prev, isVendorApproved: true }));
      }

      toast.success("Merchant storefront successfully approved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve merchant storefront.");
    } finally {
      setIsUpdatingSellerStatus(false);
    }
  };


  const handleSuspendSeller = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      await api.patch(`/admin/vendors/${sellerId}/reject`);


      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isVendorApproved: false, isActive: false } : s))
      );


      if (selectedSeller?._id === sellerId) {
        setSelectedSeller((prev) => ({ ...prev, isVendorApproved: false, isActive: false }));
      }

      toast.success("Merchant storefront suspended and deactivated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to alter approval credentials.");
    } finally {
      setIsUpdatingSellerStatus(false);
    }
  };


  const handleInitializeUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      setUpgradeApplied(true);
      toast.success("Compliance audit initiated! Verification updates will be dispatched shortly.");
    }, 1500);
  };


  const filteredSellers = sellersList.filter((s) => {
    const q = sellersSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.storeName?.toLowerCase().includes(q) ||
      s.vendorLocation?.toLowerCase().includes(q)
    );
  });


  const memberSinceDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
      })
    : "May 2026";

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-[#e1dcc9]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >

        <div className="border-b border-[#412d15]/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-[#e1dcc9]/12 bg-[#e1dcc9]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[#e1dcc9]/85 mb-2.5 font-semibold">
              Security Core
            </span>
            <h1 className="text-3xl md:text-5xl font-anton uppercase tracking-wider text-white flex items-center gap-3">
              Secure Profile <span className="text-[#e1dcc9]/50">Portal</span>
            </h1>
            <p className="text-white/60 mt-2 text-xs md:text-sm font-sans font-light">
              Manage your authenticated credentials, physical delivery grids, storefront details, and global platform oversight.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/45 border border-[#412d15] rounded-xl px-4 py-2 self-start md:self-auto">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9]/70 font-mono">
              Secure Ledger Node Linked
            </span>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">


          <div className="lg:col-span-4 space-y-6">


            <div className="relative overflow-hidden rounded-[2.2rem] border border-[#e1dcc9]/12 bg-gradient-to-br from-[#1b120a]/80 via-black/85 to-[#0c0804]/90 p-7 shadow-2xl backdrop-blur-3xl group">

              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#e1dcc9]/3 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#412d15]/20 rounded-full blur-3xl pointer-events-none" />


              <div className="flex flex-col items-center text-center relative z-10 py-2">
                <div className="relative group/avatar cursor-pointer">

                  <div
                    className="absolute -inset-2.5 rounded-full border border-dashed border-[#e1dcc9]/25 pointer-events-none"
                    style={{ animation: "spin 25s linear infinite" }}
                  />

                  <div className="absolute -inset-1.5 rounded-full border border-[#e1dcc9]/10 animate-pulse pointer-events-none" />


                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#412d15] to-[#1f150c] border border-[#e1dcc9]/40 flex items-center justify-center shadow-[0_0_40px_rgba(65,45,21,0.45)] group-hover/avatar:border-[#e1dcc9] transition-all duration-300">
                    <span className="text-3xl font-black tracking-widest text-[#e1dcc9] select-none font-anton">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold uppercase tracking-wider text-white mt-6 font-oswald leading-snug">
                  {user?.name || "Premium Explorer"}
                </h2>


                <span className="mt-2 inline-flex items-center px-3.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-[#e1dcc9]/10 border border-[#e1dcc9]/30 text-[#e1dcc9] shadow-glow-sm">
                  {user?.role || "BUYER"} CORE
                </span>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#412d15] to-transparent my-4" />

                <div className="w-full text-left space-y-2 text-xs text-white/70">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#e1dcc9]/50 shrink-0" />
                    <span className="truncate font-light">{user?.email || "member@vendorhub.com"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#e1dcc9]/50 shrink-0" />
                    <span className="font-light">Node Verified: {memberSinceDate}</span>
                  </div>
                </div>
              </div>
            </div>


            <div className="rounded-[1.8rem] border border-[#412d15] bg-black/45 p-5 space-y-3 shadow-md relative overflow-hidden font-mono text-[10px]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-white/50 border-b border-[#412d15]/40 pb-2 mb-2 uppercase tracking-widest">
                <Terminal className="w-3.5 h-3.5 text-[#e1dcc9]/70" />
                <span>Diagnostic Telemetry Sync</span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>Core Ledger Response:</span>
                <span className="text-[#e1dcc9] font-bold">12ms (SSL secure)</span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>Active Server Grid:</span>
                <span className="text-white font-semibold">Mumbai South (IN-W1)</span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>Verification Keys:</span>
                <span className="text-[#e1dcc9]/60">SHA-256 / Dynamic Verified</span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>Platform Commission:</span>
                <span className="text-emerald-400 font-bold">Secure Gateway Link</span>
              </div>
            </div>


            <div className="rounded-[1.8rem] border border-[#412d15] bg-[#1f150c]/25 p-3.5 space-y-2 shadow-inner">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/40 mb-2 px-2.5">
                Portal Options
              </p>

              <button
                onClick={() => setActiveTab("identity")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-left border transition-all duration-300 ${
                  activeTab === "identity"
                    ? "bg-[#e1dcc9] text-black border-transparent shadow-glow-sm"
                    : "border-transparent text-[#e1dcc9]/70 hover:bg-[#412d15]/40 hover:text-white"
                }`}
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <span>Identity Settings</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-left border transition-all duration-300 ${
                  activeTab === "addresses"
                    ? "bg-[#e1dcc9] text-black border-transparent shadow-glow-sm"
                    : "border-transparent text-[#e1dcc9]/70 hover:bg-[#412d15]/40 hover:text-white"
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Delivery Nodes ({user?.addresses?.length || 0})</span>
              </button>

              {user?.role === "buyer" && (
                <button
                  onClick={() => setActiveTab("upgrade")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-left border transition-all duration-300 ${
                    activeTab === "upgrade"
                      ? "bg-[#e1dcc9] text-black border-transparent shadow-glow-sm"
                      : "border-transparent text-[#e1dcc9]/70 hover:bg-[#412d15]/40 hover:text-white"
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Merchant Upgrade</span>
                </button>
              )}

              {user?.role === "seller" && (
                <button
                  onClick={() => setActiveTab("storefront")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-left border transition-all duration-300 ${
                    activeTab === "storefront"
                      ? "bg-[#e1dcc9] text-black border-transparent shadow-glow-sm"
                      : "border-transparent text-[#e1dcc9]/70 hover:bg-[#412d15]/40 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Storefront Settings</span>
                </button>
              )}

              {user?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("oversight")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-left border transition-all duration-300 ${
                    activeTab === "oversight"
                      ? "bg-[#e1dcc9] text-black border-transparent shadow-glow-sm"
                      : "border-transparent text-[#e1dcc9]/70 hover:bg-[#412d15]/40 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Merchant Oversight</span>
                </button>
              )}
            </div>
          </div>


          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">


              {activeTab === "identity" && (
                <motion.div
                  key="tab-identity"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/25 p-6 md:p-8 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#412d15]/40 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center shadow-inner">
                        <UserIcon className="w-5 h-5 text-[#e1dcc9]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Identity Settings</h3>
                        <p className="text-[10px] text-white/50 tracking-wide font-sans">Manage certified member credentials</p>
                      </div>
                    </div>

                    {!isEditingProfile && (
                      <Button
                        onClick={() => {
                          setProfileName(user?.name || "");
                          setProfileEmail(user?.email || "");
                          setIsEditingProfile(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-[#412d15] hover:bg-[#412d15]/30 text-xs font-bold font-oswald uppercase"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Modify Core
                      </Button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                          Display Identity
                        </span>
                        <p className="text-sm font-semibold text-white bg-black/45 border border-[#412d15]/40 rounded-xl px-4 py-3.5">
                          {user?.name || "Not Configured"}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                          Primary Verified Email
                        </span>
                        <p className="text-sm font-semibold text-white bg-black/45 border border-[#412d15]/40 rounded-xl px-4 py-3.5">
                          {user?.email || "Not Configured"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileSubmit} className="space-y-6 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors font-mono">
                            Full Name
                          </label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/30" />
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              required
                              className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-sm text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 group">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors font-mono">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/30" />
                            <input
                              type="email"
                              value={profileEmail}
                              onChange={(e) => setProfileEmail(e.target.value)}
                              required
                              className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-sm text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          variant="outline"
                          className="border-[#412d15] hover:bg-[#412d15]/30 font-bold font-oswald uppercase text-xs"
                          disabled={isSavingProfile}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="premium"
                          className="shadow-glow-sm text-xs font-bold font-oswald uppercase px-5"
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? (
                            <>
                              <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-1.5" />
                              Save Core Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}


              {activeTab === "addresses" && (
                <motion.div
                  key="tab-addresses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/25 p-6 md:p-8 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#412d15]/40 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center shadow-inner">
                        <MapPin className="w-5 h-5 text-[#e1dcc9]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Delivery Grid Coordinates</h3>
                        <p className="text-[10px] text-white/50 tracking-wide font-sans">Manage physical drop terminal region inputs</p>
                      </div>
                    </div>

                    {!isAddressFormOpen && (
                      <Button
                        onClick={openAddAddress}
                        variant="glow"
                        size="sm"
                        className="gap-1.5 text-xs font-black font-oswald uppercase"
                      >
                        <Plus className="w-4 h-4 text-black" />
                        Add Node
                      </Button>
                    )}
                  </div>


                  <AnimatePresence>
                    {isAddressFormOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border border-[#412d15]/60 bg-black/45 rounded-2xl p-5 mb-8 relative z-10 overflow-hidden shadow-inner"
                      >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#412d15]/40">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-[#e1dcc9] flex items-center gap-2 font-oswald">
                            <Map className="w-4 h-4" />
                            {editingAddressId ? "Modify Terminal Coordinate" : "Calibrate New Node Coordinate"}
                          </h4>
                          <button
                            onClick={closeAddressForm}
                            className="w-7 h-7 rounded-lg bg-[#412d15]/30 hover:bg-[#412d15] flex items-center justify-center text-muted-foreground hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="space-y-4 font-sans text-xs text-white/70">
                          <div className="space-y-2 group">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                              Street Address / Suite Landmark
                            </label>
                            <input
                              type="text"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              required
                              placeholder="e.g. 104 Luxury Heights, Carter Road"
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                District City
                              </label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                placeholder="Mumbai"
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 transition-all"
                              />
                            </div>
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                State Region
                              </label>
                              <input
                                type="text"
                                value={stateName}
                                onChange={(e) => setStateName(e.target.value)}
                                required
                                placeholder="Maharashtra"
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 transition-all"
                              />
                            </div>
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                Pincode Index
                              </label>
                              <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                required
                                placeholder="400001"
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                Country Node
                              </label>
                              <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white focus:outline-none focus:border-[#e1dcc9]/40"
                                placeholder="India"
                              />
                            </div>

                            <div className="flex items-center gap-2.5 h-full mt-6">
                              <label className="relative flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isDefault}
                                  onChange={(e) => setIsDefault(e.target.checked)}
                                  className="sr-only peer"
                                  disabled={user?.addresses?.length === 0}
                                />
                                <div className="w-5 h-5 rounded border border-[#412d15] bg-black/45 flex items-center justify-center peer-checked:bg-[#e1dcc9] peer-checked:border-[#e1dcc9] transition-all">
                                  {isDefault && <Check className="w-3.5 h-3.5 text-black stroke-[3.5px]" />}
                                </div>
                                <span className="ml-2.5 text-[11px] text-white/50 peer-checked:text-white transition-colors font-medium">
                                  Set as primary destination grid
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3">
                            <Button
                              type="button"
                              onClick={closeAddressForm}
                              variant="outline"
                              size="sm"
                              className="border-[#412d15] hover:bg-[#412d15]/30 font-bold font-oswald uppercase text-xs"
                              disabled={isSavingAddress}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              variant="premium"
                              size="sm"
                              className="font-bold font-oswald uppercase text-xs px-5 shadow-glow-sm"
                              disabled={isSavingAddress}
                            >
                              {isSavingAddress ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1.5" />
                                  Calibrate drop Node
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>


                  <div className="space-y-4 relative z-10">
                    {!user?.addresses || user.addresses.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-[#412d15]/50 rounded-2xl bg-black/25">
                        <MapPin className="w-10 h-10 text-[#e1dcc9] mx-auto opacity-35 mb-3" />
                        <p className="text-xs text-white/50 font-sans font-light">
                          No delivery terminals logged. Add Mumbai addresses to receive shipments.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map((addr) => (
                          <div
                            key={addr._id}
                            className={`border rounded-2xl p-5 flex flex-col justify-between transition-all bg-black/45 relative group ${
                              addr.isDefault
                                ? "border-[#e1dcc9]/40 shadow-[0_4px_24px_rgba(225,220,201,0.04)] bg-black/55"
                                : "border-[#412d15]/40 hover:border-[#412d15]"
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start">
                                {addr.isDefault ? (
                                  <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                                    Default Terminal
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSetDefaultAddress(addr._id)}
                                    className="text-[9px] font-bold uppercase tracking-wider text-[#e1dcc9]/45 hover:text-[#e1dcc9] transition-all border border-[#412d15] hover:bg-[#412d15]/20 rounded-full px-2.5 py-0.5"
                                  >
                                    Set primary
                                  </button>
                                )}

                                <div className="flex items-center gap-1 opacity-55 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openEditAddress(addr)}
                                    className="p-1.5 hover:bg-[#412d15]/40 rounded-lg text-white/50 hover:text-white transition-all"
                                    title="Edit Coordinate"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAddress(addr._id)}
                                    className="p-1.5 hover:bg-red-950/20 rounded-lg text-white/50 hover:text-red-400 transition-all"
                                    title="Deactivate Coordinate"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-sm font-semibold text-white pt-1">
                                {addr.street}
                              </div>
                              <div className="text-xs text-white/60 font-sans font-light">
                                {addr.city}, {addr.state} — {addr.pincode}
                              </div>
                              <div className="text-[9px] text-[#e1dcc9]/70 font-mono uppercase tracking-widest flex items-center gap-1.5 pt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e1dcc9]/60" />
                                {addr.country || "India"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}


              {user?.role === "buyer" && activeTab === "upgrade" && (
                <motion.div
                  key="tab-upgrade"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/25 p-6 md:p-8 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#412d15]/40 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center shadow-inner">
                      <Award className="w-5 h-5 text-[#e1dcc9]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Merchant Core Upgrade</h3>
                      <p className="text-[10px] text-white/50 tracking-wide font-sans">Apply for secure boutique sales authorization</p>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="bg-black/35 border border-[#412d15] rounded-2xl p-5 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/10 flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-[#e1dcc9]/70 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[#e1dcc9] font-oswald mb-1">
                        Authorization Upgrade Protocol
                      </h4>
                      <p className="text-xs text-white/60 font-sans font-light max-w-md mx-auto leading-relaxed mt-1">
                        Instantiate your secure boutique catalog, zero listing fees, direct local Mumbai logistics coordination, and weekly Recharts analytics splits.
                      </p>

                      {upgradeApplied ? (
                        <div className="mt-6 flex items-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-4 py-2.5 rounded-full text-xs font-semibold">
                          <Check className="w-4 h-4 shrink-0" />
                          Compliance Audit Initiated — Awaiting Admin Review
                        </div>
                      ) : (
                        <Button
                          onClick={handleInitializeUpgrade}
                          disabled={isUpgrading}
                          variant="premium"
                          className="mt-6 font-bold font-oswald uppercase text-xs shadow-glow-sm"
                        >
                          {isUpgrading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                              Verifying records...
                            </>
                          ) : (
                            <>
                              Initialize Merchant Upgrade
                              <ArrowRight className="w-4 h-4 ml-1.5" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs uppercase tracking-[0.25em] font-black text-[#e1dcc9]/70 font-oswald">
                        Merchant Authorization Perks
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-[#412d15] bg-black/25">
                          <span className="text-[10px] font-bold text-[#e1dcc9] font-mono block mb-1">01 / ZERO LISTING FEES</span>
                          <p className="text-[10px] text-white/50 leading-relaxed font-light">
                            Only split commissions standard platform bounds during secure checkout verify states.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl border border-[#412d15] bg-black/25">
                          <span className="text-[10px] font-bold text-[#e1dcc9] font-mono block mb-1">02 / LOCAL DISPATCHES</span>
                          <p className="text-[10px] text-white/50 leading-relaxed font-light">
                            Coordinate shipping from localized Bandra, Juhu, Colaba, or Powai nodes.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl border border-[#412d15] bg-black/25">
                          <span className="text-[10px] font-bold text-[#e1dcc9] font-mono block mb-1">03 / ANALYTICAL LEDGERS</span>
                          <p className="text-[10px] text-white/50 leading-relaxed font-light">
                            Unlock weekly revenue charts, pricing assistant simulators, and inventory dashboards.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {user?.role === "seller" && activeTab === "storefront" && (
                <motion.div
                  key="tab-storefront"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/25 p-6 md:p-8 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#412d15]/40 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center shadow-inner">
                        <Store className="w-5 h-5 text-[#e1dcc9]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Storefront Settings</h3>
                        <p className="text-[10px] text-white/50 tracking-wide font-sans">Manage public-facing merchant storefront parameters</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user?.isVendorApproved ? (
                        <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400 animate-pulse">
                          Audit Pending
                        </span>
                      )}

                      {!isEditingStore && (
                        <Button
                          onClick={() => setIsEditingStore(true)}
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-[#412d15] hover:bg-[#412d15]/30 text-xs font-bold font-oswald uppercase"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Modify Store
                        </Button>
                      )}
                    </div>
                  </div>

                  {!isEditingStore ? (
                    <div className="space-y-5 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                            Boutique Display Name
                          </span>
                          <p className="text-sm font-semibold text-white bg-black/45 border border-[#412d15]/40 rounded-xl px-4 py-3.5">
                            {user?.storeName || "Not Configured (Using username)"}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                            Boutique Terminal Location
                          </span>
                          <p className="text-sm font-semibold text-white bg-black/45 border border-[#412d15]/40 rounded-xl px-4 py-3.5 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#e1dcc9]/70" />
                            {user?.vendorLocation || "Not Configured (Mumbai standard fallback)"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                          Boutique Narrative / Brand Description
                        </span>
                        <p className="text-xs leading-relaxed text-white/80 bg-black/45 border border-[#412d15]/40 rounded-xl px-4 py-3.5 font-light">
                          {user?.storeDescription || "Enter your storefront's narrative description here."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleStoreSubmit} className="space-y-4 relative z-10 font-sans text-xs text-white/70">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 group">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                            Boutique Name
                          </label>
                          <input
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40"
                            placeholder="e.g. Bandra TechVault Studio"
                          />
                        </div>
                        <div className="space-y-2 group">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                            Boutique Terminal Location
                          </label>
                          <select
                            value={vendorLocation}
                            onChange={(e) => setVendorLocation(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white focus:outline-none focus:border-[#e1dcc9]/40 cursor-pointer"
                          >
                            {MUMBAI_LOCATIONS.map((loc) => (
                              <option key={loc} value={loc} className="bg-[#1f150c] text-white">
                                {loc}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2 group">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                          Boutique Narrative Description
                        </label>
                        <textarea
                          value={storeDescription}
                          onChange={(e) => setStoreDescription(e.target.value)}
                          rows={3}
                          className="w-full p-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40"
                          placeholder="Detail your brand narrative, design aesthetics, and product range..."
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          onClick={() => setIsEditingStore(false)}
                          variant="outline"
                          size="sm"
                          className="border-[#412d15] hover:bg-[#412d15]/30 font-bold font-oswald uppercase text-xs"
                          disabled={isSavingStore}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="premium"
                          size="sm"
                          className="font-bold font-oswald uppercase text-xs px-5 shadow-glow-sm"
                          disabled={isSavingStore}
                        >
                          {isSavingStore ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1.5" />
                              Save Storefront Configurations
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}


              {user?.role === "admin" && activeTab === "oversight" && (
                <motion.div
                  key="tab-oversight"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/25 p-6 md:p-8 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#412d15]/40 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#412d15]/50 border border-[#e1dcc9]/10 flex items-center justify-center shadow-inner">
                        <Store className="w-5 h-5 text-[#e1dcc9]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Merchant Directory Oversight</h3>
                        <p className="text-[10px] text-white/50 tracking-wide font-sans">Approve, audit, and regulate platform storefront directories</p>
                      </div>
                    </div>

                    <Button
                      onClick={fetchSellers}
                      variant="outline"
                      size="sm"
                      className="p-2 border-[#412d15] hover:bg-[#412d15]/30 text-xs shrink-0 bg-black/25 hover:text-[#e1dcc9]"
                      disabled={isFetchingSellers}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSellers ? "animate-spin" : ""}`} />
                    </Button>
                  </div>


                  <div className="relative mb-5 z-10">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={sellersSearchQuery}
                      onChange={(e) => setSellersSearchQuery(e.target.value)}
                      placeholder="Search merchants by name, email, store, or location..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/20"
                    />
                  </div>


                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin relative z-10">
                    {isFetchingSellers && sellersList.length === 0 ? (
                      <div className="flex justify-center items-center py-10">
                        <span className="w-6 h-6 border-2 border-[#e1dcc9]/30 border-t-[#e1dcc9] rounded-full animate-spin" />
                      </div>
                    ) : filteredSellers.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-[#412d15]/50 rounded-2xl bg-black/10">
                        <AlertCircle className="w-8 h-8 text-[#e1dcc9]/40 mx-auto mb-3" />
                        <p className="text-xs text-white/50 font-sans font-light">No matching merchants listed.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#412d15]/30 space-y-2">
                        {filteredSellers.map((seller) => (
                          <div
                            key={seller._id}
                            onClick={() => setSelectedSeller(seller)}
                            className="pt-3 pb-3 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#412d15]/20 rounded-xl px-3 transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[#1f150c] border border-[#e1dcc9]/25 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-[#e1dcc9] font-anton tracking-wider">
                                  {getInitials(seller.name)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#e1dcc9] transition-colors uppercase tracking-wider font-oswald">
                                  {seller.storeName || seller.name}
                                </h4>
                                <p className="text-[9px] text-white/50 truncate font-light font-sans flex items-center gap-1 mt-0.5">
                                  <UserIcon className="w-2.5 h-2.5" />
                                  {seller.name} &bull; {seller.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-[10px]">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  seller.isVendorApproved ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-amber-400 animate-pulse"
                                }`}
                                title={seller.isVendorApproved ? "Storefront Approved" : "Audit Pending"}
                              />
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  seller.isActive ? "bg-blue-400" : "bg-red-400"
                                }`}
                                title={seller.isActive ? "Account Active" : "Account Suspended"}
                              />
                              <Eye className="w-3.5 h-3.5 text-[#e1dcc9]/40 group-hover:text-white transition-colors ml-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>


      <AnimatePresence>
        {selectedSeller && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="glass-card w-full max-w-lg rounded-[2.2rem] border border-[#e1dcc9]/20 bg-[#1f150c] p-6 md:p-8 shadow-[0_32px_90px_rgba(0,0,0,0.9)] relative overflow-y-auto max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#412d15]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start pb-4 border-b border-[#412d15]/50 mb-6">
                <div>
                  <span className="inline-flex rounded-full border border-[#e1dcc9]/10 bg-[#e1dcc9]/5 px-2.5 py-0.5 text-[8px] uppercase tracking-widest text-[#e1dcc9]/85 mb-1.5 font-semibold">
                    Merchant Dossier
                  </span>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-white font-oswald">
                    {selectedSeller.storeName || "Private Merchant"}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="w-8 h-8 rounded-lg bg-black/45 border border-[#412d15] flex items-center justify-center hover:border-[#e1dcc9]/30 text-muted-foreground hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5 text-xs text-white/80 font-sans">

                <div className="flex items-center gap-4 bg-black/45 border border-[#412d15]/40 rounded-2xl p-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#412d15] to-[#1f150c] border border-[#e1dcc9]/30 flex items-center justify-center font-anton text-lg tracking-widest text-[#e1dcc9]">
                    {getInitials(selectedSeller.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white font-oswald">
                      {selectedSeller.name}
                    </h4>
                    <p className="text-xs text-white/50 font-light flex items-center gap-1.5 mt-0.5 font-sans">
                      <Mail className="w-3.5 h-3.5 text-[#e1dcc9]/60" />
                      {selectedSeller.email}
                    </p>
                  </div>
                </div>


                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                    Boutique Terminal Location
                  </span>
                  <p className="text-xs font-semibold text-white bg-black/45 border border-[#412d15]/30 rounded-xl px-4 py-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#e1dcc9]/70" />
                    {selectedSeller.vendorLocation || "Not Configured (Mumbai local default)"}
                  </p>
                </div>


                {selectedSeller.storeDescription && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                      Storefront Heritage Description
                    </span>
                    <p className="text-xs leading-relaxed text-white/80 bg-black/45 border border-[#412d15]/30 rounded-xl px-4 py-3 font-light max-h-[96px] overflow-y-auto scrollbar-thin">
                      {selectedSeller.storeDescription}
                    </p>
                  </div>
                )}


                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/45 border border-[#412d15]/30 rounded-xl p-3.5 text-center">
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 mb-1">
                      Storefront Credentials
                    </span>
                    {selectedSeller.isVendorApproved ? (
                      <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400 animate-pulse">
                        Under Review
                      </span>
                    )}
                  </div>
                  <div className="bg-black/45 border border-[#412d15]/30 rounded-xl p-3.5 text-center">
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 mb-1">
                      Access Status
                    </span>
                    {selectedSeller.isActive ? (
                      <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-blue-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-red-400">
                        Suspended
                      </span>
                    )}
                  </div>
                </div>


                <div className="border-t border-[#412d15]/50 pt-5 mt-2 flex flex-col gap-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/45 px-1 font-mono">
                    Governance Credentials Controls
                  </p>

                  <div className="flex gap-3">

                    {selectedSeller.isVendorApproved ? (
                      <Button
                        onClick={() => handleSuspendSeller(selectedSeller._id)}
                        variant="outline"
                        className="flex-1 text-xs font-bold font-oswald uppercase border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-400 gap-1.5"
                        disabled={isUpdatingSellerStatus}
                      >
                        <Lock className="w-4 h-4" />
                        Suspend Store
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApproveSeller(selectedSeller._id)}
                        variant="premium"
                        className="flex-1 text-xs font-bold font-oswald uppercase gap-1.5"
                        disabled={isUpdatingSellerStatus}
                      >
                        <Check className="w-4 h-4" />
                        Approve Store
                      </Button>
                    )}


                    <Button
                      onClick={() => handleToggleSellerActive(selectedSeller._id)}
                      variant="outline"
                      className={`flex-1 text-xs font-bold font-oswald uppercase border-[#412d15] hover:bg-[#412d15]/30 gap-1.5 ${
                        selectedSeller.isActive
                          ? "text-[#e1dcc9] hover:text-[#e1dcc9]"
                          : "text-emerald-400 hover:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                      }`}
                      disabled={isUpdatingSellerStatus}
                    >
                      {selectedSeller.isActive ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Suspend Account
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Activate Account
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
