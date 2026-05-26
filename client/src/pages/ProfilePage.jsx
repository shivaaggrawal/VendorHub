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
  Award,
  Camera,
  Layers,
  HelpCircle,
  LogOut,
  Laptop,
  Smartphone,
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

// Premium Mumbai Local Locations matching seed
const MUMBAI_LOCATIONS = [
  "Colaba, Mumbai",
  "Andheri, Mumbai",
  "Bandra, Mumbai",
  "Powai, Mumbai",
  "Juhu, Mumbai",
  "Dadar, Mumbai",
];

// Curated collection of luxury avatars for the user to choose from
const PRESETS_AVATARS = [
  { name: "Elegant Portrait Men", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop" },
  { name: "Minimalist Portrait Women", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop" },
  { name: "High Fashion Men", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop" },
  { name: "Studio Luxury Women", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" },
  { name: "Minimalist Portrait Men", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop" },
  { name: "Modern Editorial Women", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop" }
];

// Available custom tags for Shipping Addresses
const ADDRESS_TAGS = ["Home", "Work", "Boutique Hub", "Warehouse"];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);

  // Active Profile Navigation Tab
  const [activeTab, setActiveTab] = useState("identity"); // "identity", "addresses", "upgrade"/"storefront"/"oversight"

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Active Security Sessions State (simulated for professional security dashboard)
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome on Windows (10)", ip: "103.45.201.12", location: "Mumbai, India", isCurrent: true, icon: Laptop },
    { id: 2, device: "Safari on iPhone 15 Pro", ip: "49.36.88.94", location: "Mumbai, India", isCurrent: false, icon: Smartphone }
  ]);

  // Seller Storefront Edit State
  const [storeName, setStoreName] = useState(user?.storeName || "");
  const [storeDescription, setStoreDescription] = useState(user?.storeDescription || "");
  const [vendorLocation, setVendorLocation] = useState(user?.vendorLocation || MUMBAI_LOCATIONS[0]);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Address Editing State
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null means adding a new address

  // Individual Address Fields
  const [street, setStreet] = useState("");
  const [addressTag, setAddressTag] = useState(ADDRESS_TAGS[0]);
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Admin Oversight State
  const [sellersList, setSellersList] = useState([]);
  const [isFetchingSellers, setIsFetchingSellers] = useState(false);
  const [sellersSearchQuery, setSellersSearchQuery] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isUpdatingSellerStatus, setIsUpdatingSellerStatus] = useState(false);

  // Buyer Become a Partner Upgrade Form State
  const [upgradeStoreName, setUpgradeStoreName] = useState("");
  const [upgradeStoreDescription, setUpgradeStoreDescription] = useState("");
  const [upgradeVendorLocation, setUpgradeVendorLocation] = useState(MUMBAI_LOCATIONS[0]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeApplied, setUpgradeApplied] = useState(false);
  const [estimatorSales, setEstimatorSales] = useState(150000); // monthly sales slider state

  // Avatar Modal Selection State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  // Helper to split street address and category tag stored in MongoDB
  const parseStreetAndTag = (streetStr) => {
    if (!streetStr) return { street: "", tag: ADDRESS_TAGS[0] };
    const parts = streetStr.split(" | ");
    return {
      street: parts[0] || "",
      tag: parts[1] || ADDRESS_TAGS[0]
    };
  };

  // Fetch Sellers List for Admins
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

  // Sync state with user profile changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setStoreName(user.storeName || "");
      setStoreDescription(user.storeDescription || "");
      setVendorLocation(user.vendorLocation || MUMBAI_LOCATIONS[0]);
    }
  }, [user]);

  // Calculate user initials for Avatar
  const getInitials = (name) => {
    if (!name) return "VH";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Profile Update Form Handler
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
        toast.success("Profile information updated successfully.");
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

  // Terminate a security session
  const handleRevokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Device session revoked successfully.");
  };

  // Storefront settings form handler
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
        toast.success("Boutique storefront parameters saved successfully.");
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

  // Helper to sync addresses state with DB via Thunk
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

  // Open Add Address Form
  const openAddAddress = () => {
    setEditingAddressId(null);
    setStreet("");
    setAddressTag(ADDRESS_TAGS[0]);
    setCity("");
    setStateName("");
    setPincode("");
    setCountry("India");
    setIsDefault(user?.addresses?.length === 0); // first address defaults to true
    setIsAddressFormOpen(true);
  };

  // Open Edit Address Form
  const openEditAddress = (addr) => {
    const parsed = parseStreetAndTag(addr.street);
    setEditingAddressId(addr._id);
    setStreet(parsed.street);
    setAddressTag(parsed.tag);
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setCountry(addr.country || "India");
    setIsDefault(addr.isDefault || false);
    setIsAddressFormOpen(true);
  };

  // Close Address Form
  const closeAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
  };

  // Submit Address Form (Add / Edit)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      toast.error("All address fields are required.");
      return;
    }

    setIsSavingAddress(true);
    let currentAddresses = user?.addresses ? [...user.addresses] : [];

    // If this address is set to default, unset isDefault on all other addresses
    if (isDefault) {
      currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    // Merge street and address tag in one field cleanly supported by MongoDB schema
    const combinedStreetField = street.trim() + " | " + addressTag;

    const addressPayload = {
      street: combinedStreetField,
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      country: country.trim(),
      isDefault: isDefault,
    };

    if (editingAddressId) {
      // Edit mode
      currentAddresses = currentAddresses.map((addr) =>
        addr._id === editingAddressId ? { ...addr, ...addressPayload } : addr
      );
    } else {
      // Add mode
      currentAddresses.push(addressPayload);
    }

    // Save changes
    const success = await saveAddressesToDB(currentAddresses);
    setIsSavingAddress(false);

    if (success) {
      toast.success(
        editingAddressId
          ? "Address profile updated successfully."
          : "New shipping address added successfully."
      );
      closeAddressForm();
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (addrId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this shipping address?");
    if (!confirmDelete) return;

    const currentAddresses = user?.addresses ? [...user.addresses] : [];
    const targetAddress = currentAddresses.find((a) => a._id === addrId);
    let updatedAddresses = currentAddresses.filter((addr) => addr._id !== addrId);

    // If deleted address was default and we still have other addresses, assign a new default
    if (targetAddress?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    toast.info("Deleting address...");
    const success = await saveAddressesToDB(updatedAddresses);
    if (success) {
      toast.success("Delivery address de-registered.");
    }
  };

  // Set Address as Default
  const handleSetDefaultAddress = async (addrId) => {
    let currentAddresses = user?.addresses ? [...user.addresses] : [];
    currentAddresses = currentAddresses.map((a) => ({
      ...a,
      isDefault: a._id === addrId,
    }));

    toast.info("Updating default address...");
    const success = await saveAddressesToDB(currentAddresses);
    if (success) {
      toast.success("Primary shipping destination set.");
    }
  };

  // Admin Action: Toggle Active Status of a Merchant
  const handleToggleSellerActive = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      const response = await api.patch(`/admin/users/${sellerId}/toggle-active`);
      const updatedStatus = response.data?.data?.isActive;
      
      // Update local state list
      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isActive: updatedStatus } : s))
      );

      // If currently viewed seller is updated, update detail state
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

  // Admin Action: Approve a Merchant Storefront
  const handleApproveSeller = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      await api.patch(`/admin/vendors/${sellerId}/approve`);
      
      // Update local state list
      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isVendorApproved: true } : s))
      );

      // If currently viewed seller is updated, update detail state
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

  // Admin Action: Suspend / Disapprove a Merchant Storefront
  const handleSuspendSeller = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      await api.patch(`/admin/vendors/${sellerId}/reject`);
      
      // Update local state list
      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isVendorApproved: false, isActive: false } : s))
      );

      // If currently viewed seller is updated, update detail state
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

  // Initialize Merchant Upgrade request for Buyers (saves their brand info to the database first!)
  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    if (!upgradeStoreName.trim() || !upgradeStoreDescription.trim()) {
      toast.error("Please supply a boutique brand name and brand narrative.");
      return;
    }

    setIsUpgrading(true);
    try {
      // First, save their storefront preferences to the DB
      const result = await dispatch(
        updateProfile({
          storeName: upgradeStoreName.trim(),
          storeDescription: upgradeStoreDescription.trim(),
          vendorLocation: upgradeVendorLocation,
        })
      );

      if (updateProfile.fulfilled.match(result)) {
        setTimeout(() => {
          setIsUpgrading(false);
          setUpgradeApplied(true);
          toast.success("Partnership application initiated! Verification updates will be dispatched shortly.");
        }, 1200);
      } else {
        toast.error(result.payload || "Failed to process boutique details.");
        setIsUpgrading(false);
      }
    } catch (err) {
      toast.error("Network error during upgrade application.");
      setIsUpgrading(false);
    }
  };

  // Dynamic Avatar Selection Handler
  const handleSelectAvatarUrl = async (url) => {
    try {
      const result = await dispatch(updateProfile({ avatar: { url } }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Profile avatar updated successfully.");
        setIsAvatarModalOpen(false);
        setCustomAvatarUrl("");
      } else {
        toast.error(result.payload || "Failed to update avatar.");
      }
    } catch (err) {
      toast.error("Network error updating avatar.");
    }
  };

  // Filter sellers list by search query
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

  // Format "Member since" date
  const memberSinceDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
      })
    : "May 2026";

  // Dynamic account classification based on role
  const getRoleLabel = () => {
    if (user?.role === "admin") return "Director Console";
    if (user?.role === "seller") return "Boutique Curator";
    return "Collector Member";
  };

  // Shipping Tag badge styling helper
  const getTagBadgeStyle = (tag) => {
    switch (tag) {
      case "Work": return "border-blue-500/25 bg-blue-500/5 text-blue-400";
      case "Boutique Hub": return "border-[#e1dcc9]/30 bg-[#e1dcc9]/5 text-[#e1dcc9]";
      case "Warehouse": return "border-purple-500/25 bg-purple-500/5 text-purple-400";
      default: return "border-emerald-500/25 bg-emerald-500/5 text-emerald-400";
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto text-[#e1dcc9] relative overflow-hidden font-sans">
      
      {/* Floating Organic Backdrop Ambience Blobs */}
      <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-amber-500/3 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-[60%] right-[10%] w-[32rem] h-[32rem] bg-[#412d15]/10 rounded-full blur-3xl animate-blob [animation-delay:4s] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 relative z-10"
      >
        {/* Elegant Minimalist Header */}
        <div className="border-b border-[#e1dcc9]/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex rounded-full border border-[#e1dcc9]/20 bg-[#e1dcc9]/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#e1dcc9]/80 mb-3 font-medium">
              Member Profile Settings
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white flex items-center gap-3">
              Account <span className="text-[#e1dcc9]/50">Overview</span>
            </h1>
            <p className="text-white/60 mt-2 text-xs md:text-sm font-sans font-light">
              Manage your personal credentials, shipping addresses, partner catalogs, and platform director controls.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-[#1f150c]/40 border border-[#412d15]/60 rounded-full px-5 py-2.5 self-start md:self-auto shadow-premium backdrop-blur-md">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e1dcc9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e1dcc9]"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9]/90 font-mono">
              Secure Session Active
            </span>
          </div>
        </div>

        {/* Dashboard Main Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
          
          {/* LEFT COLUMN: Identity Panel, Telemetry sync & Dynamic Tab Navigation (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Interactive Boutique Member Card */}
            <div className="relative overflow-hidden rounded-[2.2rem] border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1b120a] via-black to-[#0c0804] p-8 shadow-2xl backdrop-blur-3xl group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#e1dcc9]/5 to-transparent blur-2xl pointer-events-none" />
              
              <div className="flex flex-col items-center text-center relative z-10 py-2">
                <div 
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="relative group/avatar cursor-pointer"
                  title="Change Profile Photo"
                >
                  {/* Subtle golden halo rings */}
                  <div className="absolute -inset-2.5 rounded-full border border-dashed border-[#e1dcc9]/20 group-hover/avatar:border-solid group-hover/avatar:border-[#e1dcc9]/40 transition-all duration-500" />
                  <div className="absolute -inset-1.5 rounded-full border border-[#e1dcc9]/5 group-hover/avatar:scale-105 transition-all duration-300" />
                  
                  {/* Avatar Container */}
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#412d15] to-[#1f150c] border border-[#e1dcc9]/30 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/avatar:scale-95">
                    {user?.avatar?.url ? (
                      <img 
                        src={user.avatar.url} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold tracking-normal text-[#e1dcc9] font-display">
                        {getInitials(user?.name)}
                      </span>
                    )}

                    {/* Camera icon hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <Camera className="w-5 h-5 text-[#e1dcc9]" />
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-bold font-display tracking-tight text-white mt-5 leading-snug">
                  {user?.name || "Boutique Explorer"}
                </h2>

                {/* Cyberpunk Role core badge */}
                <span className="mt-2.5 inline-flex items-center px-3.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase bg-[#e1dcc9]/10 border border-[#e1dcc9]/25 text-[#e1dcc9] font-sans">
                  {getRoleLabel()}
                </span>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#412d15] to-transparent my-5" />

                <div className="w-full text-left space-y-3.5 text-xs text-white/70">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#e1dcc9]/60 shrink-0" />
                    <span className="truncate font-light text-[13px]">{user?.email || "member@vendorhub.com"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#e1dcc9]/60 shrink-0" />
                    <span className="font-light text-[13px]">Partner since {memberSinceDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Engagement Metrics Panel */}
            <div className="rounded-[1.8rem] border border-[#412d15] bg-[#1a110a]/40 p-6 space-y-4 shadow-lg backdrop-blur-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e1dcc9]/60 border-b border-[#412d15]/40 pb-2.5 mb-1 font-sans flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#e1dcc9]/80" />
                <span>Account Activity Metrics</span>
              </h3>

              {user?.role === "buyer" && (
                <div className="space-y-3.5 text-xs font-sans">
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Wishlist Collections
                    </span>
                    <span className="text-white font-semibold font-mono bg-black/40 px-2 py-0.5 rounded border border-[#412d15]">{user?.wishlist?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Shipping Locations
                    </span>
                    <span className="text-white font-semibold font-mono bg-black/40 px-2 py-0.5 rounded border border-[#412d15]">{user?.addresses?.length || 0} locations</span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Platform Orders
                    </span>
                    <span className="text-emerald-400 font-semibold font-mono">Synced Gateways</span>
                  </div>
                </div>
              )}

              {user?.role === "seller" && (
                <div className="space-y-3.5 text-xs font-sans">
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Storefront Status
                    </span>
                    {user?.isVendorApproved ? (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[9px] uppercase tracking-wide">Approved</span>
                    ) : (
                      <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-[9px] uppercase tracking-wide animate-pulse">Pending Audit</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Dispatch Hub
                    </span>
                    <span className="text-white font-medium">{user?.vendorLocation || "Not Selected"}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Shipping Addresses
                    </span>
                    <span className="text-white font-semibold font-mono bg-black/40 px-2 py-0.5 rounded border border-[#412d15]">{user?.addresses?.length || 0} locations</span>
                  </div>
                </div>
              )}

              {user?.role === "admin" && (
                <div className="space-y-3.5 text-xs font-sans">
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Platform Partners
                    </span>
                    <span className="text-white font-semibold font-mono bg-black/40 px-2 py-0.5 rounded border border-[#412d15]">{sellersList.length} registered</span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Verified Partners
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">{sellersList.filter(s => s.isVendorApproved).length} approved</span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="font-light flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#e1dcc9]/60" /> Clearance Level
                    </span>
                    <span className="text-[#e1dcc9] font-bold text-[10px] bg-[#e1dcc9]/10 px-2 py-0.5 rounded border border-[#e1dcc9]/25 uppercase tracking-wide">Owner / Director</span>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Tab Navigation List */}
            <div className="rounded-[1.8rem] border border-[#412d15] bg-[#1f150c]/20 p-4 space-y-2.5 shadow-lg backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1dcc9]/40 mb-2.5 px-3 font-sans">
                Configuration Desk
              </p>
              
              <button
                onClick={() => setActiveTab("identity")}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-300 ${
                  activeTab === "identity"
                    ? "bg-[#e1dcc9] text-black shadow-glow-sm"
                    : "text-[#e1dcc9]/70 hover:bg-[#412d15]/30 hover:text-white"
                }`}
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <span>Personal Settings</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-300 ${
                  activeTab === "addresses"
                    ? "bg-[#e1dcc9] text-black shadow-glow-sm"
                    : "text-[#e1dcc9]/70 hover:bg-[#412d15]/30 hover:text-white"
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Shipping Addresses ({user?.addresses?.length || 0})</span>
              </button>

              {user?.role === "buyer" && (
                <button
                  onClick={() => setActiveTab("upgrade")}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-300 ${
                    activeTab === "upgrade"
                      ? "bg-[#e1dcc9] text-black shadow-glow-sm"
                      : "text-[#e1dcc9]/70 hover:bg-[#412d15]/30 hover:text-white"
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Become a Partner</span>
                </button>
              )}

              {user?.role === "seller" && (
                <button
                  onClick={() => setActiveTab("storefront")}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-300 ${
                    activeTab === "storefront"
                      ? "bg-[#e1dcc9] text-black shadow-glow-sm"
                      : "text-[#e1dcc9]/70 hover:bg-[#412d15]/30 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Boutique Details</span>
                </button>
              )}

              {user?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("oversight")}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-300 ${
                    activeTab === "oversight"
                      ? "bg-[#e1dcc9] text-black shadow-glow-sm"
                      : "text-[#e1dcc9]/70 hover:bg-[#412d15]/30 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Merchant Approvals</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Display Active Tab Contents (lg:col-span-8) */}
          <div className="lg:col-span-8 font-sans">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: IDENTITY SETTINGS EDIT FORM & SESSIONS LOG */}
              {activeTab === "identity" && (
                <motion.div
                  key="tab-identity"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Personal Settings Card */}
                  <div className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/15 p-6 md:p-10 shadow-premium relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-[#e1dcc9]/3 to-transparent blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#412d15]/40 relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/15 flex items-center justify-center shadow-inner">
                          <UserIcon className="w-5 h-5 text-[#e1dcc9]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base font-display tracking-tight">Personal Information</h3>
                          <p className="text-[10px] text-white/50 tracking-wider uppercase font-sans font-light">Update your profile parameters</p>
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
                          className="gap-1.5 border-[#412d15] hover:bg-[#412d15]/30 text-xs font-bold font-sans uppercase"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Profile
                        </Button>
                      )}
                    </div>

                    {!isEditingProfile ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-left">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                            Display Name
                          </span>
                          <p className="text-sm font-semibold text-white bg-black/35 border border-[#412d15]/30 rounded-xl px-4 py-4 font-sans">
                            {user?.name || "Not Configured"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                            Primary Email Address
                          </span>
                          <p className="text-sm font-semibold text-white bg-black/35 border border-[#412d15]/30 rounded-xl px-4 py-4 font-sans">
                            {user?.email || "Not Configured"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleProfileSubmit} className="space-y-6 relative z-10 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors font-mono">
                              Full Name
                            </label>
                            <div className="relative">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/40" />
                              <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                required
                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/35 text-sm text-white placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 focus:shadow-[0_0_12px_rgba(225,220,201,0.12)] transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] font-sans"
                                placeholder="John Doe"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e1dcc9]/60 group-focus-within:text-[#e1dcc9] transition-colors font-mono">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e1dcc9]/40" />
                              <input
                                type="email"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                required
                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#412d15]/50 bg-black/35 text-sm text-white placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 focus:shadow-[0_0_12px_rgba(225,220,201,0.12)] transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] font-sans"
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
                            className="border-[#412d15] hover:bg-[#412d15]/30 font-bold font-sans uppercase text-xs"
                            disabled={isSavingProfile}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="premium"
                            className="shadow-glow-sm text-xs font-bold font-sans uppercase px-6"
                            disabled={isSavingProfile}
                          >
                            {isSavingProfile ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1.5" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Security session log */}
                  <div className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/15 p-6 md:p-10 shadow-premium relative overflow-hidden backdrop-blur-xl text-left">
                    <h3 className="font-bold text-white text-base font-display tracking-tight">Account Security</h3>
                    <p className="text-[10px] text-white/50 tracking-wider uppercase font-sans font-light mb-6 border-b border-[#412d15]/40 pb-4">
                      Monitor and revoke active device nodes
                    </p>

                    <div className="space-y-4">
                      {activeSessions.map((session) => {
                        const IconComponent = session.icon;
                        return (
                          <div 
                            key={session.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-[#412d15]/50 bg-black/25 hover:border-[#e1dcc9]/10 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#412d15]/20 border border-[#e1dcc9]/10 flex items-center justify-center text-[#e1dcc9]/70 shrink-0">
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">{session.device}</h4>
                                  {session.isCurrent && (
                                    <span className="bg-[#e1dcc9]/10 border border-[#e1dcc9]/30 text-[#e1dcc9] px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono">Current Node</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-white/50 font-mono mt-0.5">IP Address: {session.ip} &bull; {session.location} &bull; {session.time}</p>
                              </div>
                            </div>

                            {!session.isCurrent && (
                              <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all font-sans"
                                title="Revoke Device Session"
                              >
                                <LogOut className="w-3 h-3" />
                                Terminate
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SHIPPING ADDRESSES LIST AND CREATE FORMS */}
              {activeTab === "addresses" && (
                <motion.div
                  key="tab-addresses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/15 p-6 md:p-10 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-[#e1dcc9]/3 to-transparent blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#412d15]/40 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/15 flex items-center justify-center shadow-inner">
                        <MapPin className="w-5 h-5 text-[#e1dcc9]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base font-display tracking-tight">Address Directory</h3>
                        <p className="text-[10px] text-white/50 tracking-wider uppercase font-sans font-light">Manage physical delivery destinations</p>
                      </div>
                    </div>

                    {!isAddressFormOpen && (
                      <Button
                        onClick={openAddAddress}
                        variant="glow"
                        size="sm"
                        className="gap-1.5 text-xs font-black font-sans uppercase"
                      >
                        <Plus className="w-4 h-4 text-black" />
                        Add Address
                      </Button>
                    )}
                  </div>

                  {/* Add / Edit address expand section */}
                  <AnimatePresence>
                    {isAddressFormOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border border-[#412d15]/60 bg-black/35 rounded-2xl p-6 mb-8 relative z-10 overflow-hidden shadow-inner text-left"
                      >
                        <div className="flex justify-between items-center mb-5 pb-2.5 border-b border-[#412d15]/40 font-display">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-[#e1dcc9] flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            {editingAddressId ? "Modify Shipping Location" : "Create Shipping Location"}
                          </h4>
                          <button
                            onClick={closeAddressForm}
                            className="w-7 h-7 rounded-lg bg-[#412d15]/30 hover:bg-[#412d15] flex items-center justify-center text-[#e1dcc9]/50 hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="space-y-4 font-sans text-xs text-white/70">
                          
                          {/* Category tag selector */}
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                              Address Destination Category
                            </label>
                            <div className="flex gap-2">
                              {ADDRESS_TAGS.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => setAddressTag(tag)}
                                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                    addressTag === tag
                                      ? "bg-[#e1dcc9] border-transparent text-black shadow-glow-sm"
                                      : "border-[#412d15] bg-black/45 text-white/50 hover:border-[#e1dcc9]/30"
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 group">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                              Street Address / Landmark Suite
                            </label>
                            <input
                              type="text"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              required
                              placeholder="e.g. 104 Luxury Heights, Carter Road"
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/25 transition-all font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                City
                              </label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                placeholder="Mumbai"
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                              />
                            </div>
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                State
                              </label>
                              <input
                                type="text"
                                value={stateName}
                                onChange={(e) => setStateName(e.target.value)}
                                required
                                placeholder="Maharashtra"
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                              />
                            </div>
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                ZIP / Postal Code
                              </label>
                              <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                required
                                placeholder="400001"
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div className="space-y-2 group">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                                Country
                              </label>
                              <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                                placeholder="India"
                              />
                            </div>

                            {/* Sliding Switch Toggle for Default Address */}
                            <div className="flex items-center gap-3.5 h-full mt-6 pl-1 select-none">
                              <button
                                type="button"
                                onClick={() => setIsDefault(!isDefault)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                                  isDefault ? "bg-[#e1dcc9]" : "bg-black/55 border border-[#412d15]/60"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                                    isDefault ? "translate-x-5 bg-black" : "translate-x-0 bg-[#e1dcc9]/60"
                                  }`}
                                />
                              </button>
                              <span className="text-[11px] text-white/50 font-medium">
                                Set as primary shipping destination
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3">
                            <Button
                              type="button"
                              onClick={closeAddressForm}
                              variant="outline"
                              size="sm"
                              className="border-[#412d15] hover:bg-[#412d15]/30 font-bold font-sans uppercase text-xs"
                              disabled={isSavingAddress}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              variant="premium"
                              size="sm"
                              className="font-bold font-sans uppercase text-xs px-5 shadow-glow-sm"
                              disabled={isSavingAddress}
                            >
                              {isSavingAddress ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1.5" />
                                  Save Location
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Saved addresses grid list */}
                  <div className="space-y-4 relative z-10 text-left font-sans">
                    {!user?.addresses || user.addresses.length === 0 ? (
                      <div className="text-center py-14 border border-dashed border-[#412d15]/50 rounded-2xl bg-black/15">
                        <MapPin className="w-10 h-10 text-[#e1dcc9] mx-auto opacity-35 mb-3" />
                        <p className="text-xs text-white/50 font-sans font-light">
                          No delivery addresses recorded. Add one above to handle boutique dispatches.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map((addr) => {
                          const parsed = parseStreetAndTag(addr.street);
                          return (
                            <div
                              key={addr._id}
                              className={`border rounded-2xl p-5 flex flex-col justify-between transition-all bg-black/35 relative group ${
                                addr.isDefault
                                  ? "border-[#e1dcc9]/40 shadow-premium bg-black/55"
                                  : "border-[#412d15]/40 hover:border-[#e1dcc9]/20"
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${getTagBadgeStyle(parsed.tag)}`}>
                                      {parsed.tag}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                                        Primary
                                      </span>
                                    )}
                                  </div>

                                  {!addr.isDefault && (
                                    <button
                                      onClick={() => handleSetDefaultAddress(addr._id)}
                                      className="text-[9px] font-bold uppercase tracking-wider text-[#e1dcc9]/45 hover:text-[#e1dcc9] transition-all border border-[#412d15] hover:bg-[#412d15]/20 rounded-full px-2.5 py-0.5 font-sans"
                                    >
                                      Set Primary
                                    </button>
                                  )}
                                </div>

                                <div className="text-sm font-semibold text-white pt-2 font-sans">
                                  {parsed.street}
                                </div>
                                <div className="text-xs text-white/60 font-sans font-light">
                                  {addr.city}, {addr.state} — {addr.pincode}
                                </div>
                                <div className="flex items-center justify-between border-t border-[#412d15]/20 pt-3.5 mt-2">
                                  <div className="text-[9px] text-[#e1dcc9]/70 font-mono uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e1dcc9]/60" />
                                    {addr.country || "India"}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                      onClick={() => openEditAddress(addr)}
                                      className="p-1.5 hover:bg-[#412d15]/40 rounded-lg text-[#e1dcc9]/50 hover:text-white transition-all"
                                      title="Edit Address"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAddress(addr._id)}
                                      className="p-1.5 hover:bg-red-950/20 rounded-lg text-white/50 hover:text-red-400 transition-all"
                                      title="Delete Address"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3 (BUYER SPECIAL): PARTNERSHIP UPGRADE BOARD & SLIDER ESTIMATOR */}
              {user?.role === "buyer" && activeTab === "upgrade" && (
                <motion.div
                  key="tab-upgrade"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/15 p-6 md:p-10 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-[#e1dcc9]/3 to-transparent blur-3xl pointer-events-none" />

                  <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-[#412d15]/40 relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/15 flex items-center justify-center shadow-inner">
                      <Award className="w-5 h-5 text-[#e1dcc9]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base font-display tracking-tight">Curated Seller Application</h3>
                      <p className="text-[10px] text-white/50 tracking-wider uppercase font-sans font-light">Upgrade your collector status</p>
                    </div>
                  </div>

                  <div className="space-y-8 relative z-10 font-sans">
                    <div className="bg-black/35 border border-[#412d15] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-[#412d15]/20 border border-[#e1dcc9]/10 flex items-center justify-center shrink-0">
                        <Lock className="w-7 h-7 text-[#e1dcc9]/80 animate-pulse" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold tracking-tight text-[#e1dcc9] font-display mb-1">
                          Become an Authorized Merchant Curator
                        </h4>
                        <p className="text-xs text-white/60 font-sans font-light leading-relaxed mt-1">
                          Apply to unlock your seller storefront, list exclusive luxury catalogs, set custom boutique dispatches, and review real-time revenue analytics.
                        </p>
                      </div>
                    </div>

                    {upgradeApplied ? (
                      <div className="flex justify-center items-center py-6">
                        <div className="flex items-center gap-3.5 text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-6 py-4 rounded-xl text-xs font-semibold max-w-md text-center font-sans">
                          <Check className="w-5 h-5 shrink-0 stroke-[3px]" />
                          <div className="text-left">
                            <div className="font-bold uppercase tracking-wider font-sans">Application Under Review</div>
                            <div className="text-[11px] text-white/50 font-normal mt-0.5">Your boutique narrative and hub location details have been saved. Our board is auditing credentials.</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleUpgradeSubmit} className="space-y-6 font-sans text-xs text-white/70 text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                              Boutique Brand Name
                            </label>
                            <input
                              type="text"
                              value={upgradeStoreName}
                              onChange={(e) => setUpgradeStoreName(e.target.value)}
                              required
                              placeholder="e.g. Vintage Tech & Co"
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                              Dispatch Hub Hub
                            </label>
                            <select
                              value={upgradeVendorLocation}
                              onChange={(e) => setUpgradeVendorLocation(e.target.value)}
                              required
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#e1dcc9]/40 cursor-pointer font-sans"
                            >
                              {MUMBAI_LOCATIONS.map((loc) => (
                                <option key={loc} value={loc} className="bg-[#1f150c] text-white">
                                  {loc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                            Boutique Narrative / Vision
                          </label>
                          <textarea
                            value={upgradeStoreDescription}
                            onChange={(e) => setUpgradeStoreDescription(e.target.value)}
                            required
                            rows={3}
                            placeholder="Detail your brand narrative, design aesthetics, and what exclusive catalogs you wish to showcase..."
                            className="w-full p-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                          />
                        </div>

                        {/* Revenue Estimator and Split Calculator */}
                        <div className="border border-[#412d15]/60 bg-black/25 rounded-2xl p-6 space-y-5">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-semibold tracking-wide text-white font-sans">Monthly Revenue Estimator</h4>
                            <span className="text-sm font-black text-[#e1dcc9] font-mono">₹{estimatorSales.toLocaleString()} / mo</span>
                          </div>

                          <div className="space-y-1 relative">
                            <input 
                              type="range"
                              min="10000"
                              max="1000000"
                              step="10000"
                              value={estimatorSales}
                              onChange={(e) => setEstimatorSales(Number(e.target.value))}
                              className="w-full h-1 bg-[#412d15] rounded-lg appearance-none cursor-pointer accent-[#e1dcc9]"
                            />
                            <div className="flex justify-between text-[9px] text-white/40 font-mono pt-1">
                              <span>₹10,000</span>
                              <span>₹5,000,000</span>
                              <span>₹1,000,000</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-sans">
                            <div className="p-3.5 rounded-xl border border-[#412d15]/40 bg-[#1f150c]/20">
                              <span className="block text-[8px] font-bold text-white/45 uppercase tracking-wider mb-1">Your Take-Home Split (92%)</span>
                              <span className="text-base font-extrabold text-emerald-400 font-mono">₹{Math.round(estimatorSales * 0.92).toLocaleString()}</span>
                            </div>
                            <div className="p-3.5 rounded-xl border border-[#412d15]/40 bg-[#1f150c]/20">
                              <span className="block text-[8px] font-bold text-white/45 uppercase tracking-wider mb-1">Platform Commission (8%)</span>
                              <span className="text-base font-extrabold text-white/40 font-mono">₹{Math.round(estimatorSales * 0.08).toLocaleString()}</span>
                            </div>
                            <div className="p-3.5 rounded-xl border border-[#412d15]/40 bg-[#1f150c]/20">
                              <span className="block text-[8px] font-bold text-white/45 uppercase tracking-wider mb-1">Listing Saver (No Fees)</span>
                              <span className="text-base font-extrabold text-[#e1dcc9] font-mono">₹{Math.round(estimatorSales * 0.05).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button
                            type="submit"
                            disabled={isUpgrading}
                            variant="premium"
                            className="font-bold font-sans uppercase text-xs shadow-glow-sm px-6 py-5 rounded-xl flex items-center gap-2"
                          >
                            {isUpgrading ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing Application...
                              </>
                            ) : (
                              <>
                                Submit Partnership Application
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-4 pt-4 border-t border-[#412d15]/40 text-left">
                      <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#e1dcc9]/70 font-display">
                        Merchant Curator Perks
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-[#412d15]/50 bg-black/15">
                          <span className="text-[10px] font-bold text-[#e1dcc9] font-mono block mb-1">01 / ZERO LISTING FEES</span>
                          <p className="text-[10px] text-white/50 leading-relaxed font-light font-sans">
                            Only pay standard commission rates upon successful purchases, with no subscription overheads.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl border border-[#412d15]/50 bg-black/15">
                          <span className="text-[10px] font-bold text-[#e1dcc9] font-mono block mb-1">02 / LOCAL SHIPPING HUBS</span>
                          <p className="text-[10px] text-white/50 leading-relaxed font-light font-sans">
                            Easily dispatch products from localized Juhu, Bandra, Colaba, or Powai nodes.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl border border-[#412d15]/50 bg-black/15">
                          <span className="text-[10px] font-bold text-[#e1dcc9] font-mono block mb-1">03 / PREMIUM ANALYTICS</span>
                          <p className="text-[10px] text-white/50 leading-relaxed font-light font-sans">
                            Unlock weekly analytics split matrices, revenue trend charts, and sales simulators.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3 (SELLER SPECIAL): STOREFRONT CONFIGURATION & LIVE CARD PREVIEW */}
              {user?.role === "seller" && activeTab === "storefront" && (
                <motion.div
                  key="tab-storefront"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/15 p-6 md:p-10 shadow-premium relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-[#e1dcc9]/3 to-transparent blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#412d15]/40 relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/15 flex items-center justify-center shadow-inner">
                          <Store className="w-5 h-5 text-[#e1dcc9]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base font-display tracking-tight">Boutique Identity</h3>
                          <p className="text-[10px] text-white/50 tracking-wider uppercase font-sans font-light">Configure your public storefront branding</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5">
                        {user?.isVendorApproved ? (
                          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400 font-sans">
                            Active Store
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-400 animate-pulse font-sans">
                            Audit Pending
                          </span>
                        )}

                        {!isEditingStore && (
                          <Button
                            onClick={() => setIsEditingStore(true)}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-[#412d15] hover:bg-[#412d15]/30 text-xs font-bold font-sans uppercase"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Modify Store
                          </Button>
                        )}
                      </div>
                    </div>

                    {!isEditingStore ? (
                      <div className="space-y-6 relative z-10 text-left font-sans">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                              Boutique Name
                            </span>
                            <p className="text-sm font-semibold text-white bg-black/35 border border-[#412d15]/30 rounded-xl px-4 py-4 font-sans">
                              {user?.storeName || "Curated Vintage Hub"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                              Dispatch Hub Region
                            </span>
                            <p className="text-sm font-semibold text-white bg-black/35 border border-[#412d15]/30 rounded-xl px-4 py-4 flex items-center gap-2 font-sans">
                              <MapPin className="w-4 h-4 text-[#e1dcc9]/60 animate-pulse" />
                              {user?.vendorLocation || "Bandra, Mumbai"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                            Boutique Narrative
                          </span>
                          <p className="text-xs leading-relaxed text-white/80 bg-black/35 border border-[#412d15]/30 rounded-xl px-4 py-4 font-light min-h-[80px] font-sans">
                            {user?.storeDescription || "Add details describing your brand narrative, premium aesthetics, and unique catalogs."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleStoreSubmit} className="space-y-5 relative z-10 font-sans text-xs text-white/70 text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                              Boutique Name
                            </label>
                            <input
                              type="text"
                              value={storeName}
                              onChange={(e) => setStoreName(e.target.value)}
                              required
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                              placeholder="e.g. Bandra TechVault Studio"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                              Dispatch Hub Location
                            </label>
                            <select
                              value={vendorLocation}
                              onChange={(e) => setVendorLocation(e.target.value)}
                              required
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white focus:outline-none focus:border-[#e1dcc9]/40 cursor-pointer font-sans"
                            >
                              {MUMBAI_LOCATIONS.map((loc) => (
                                <option key={loc} value={loc} className="bg-[#1f150c] text-white">
                                  {loc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                            Boutique Narrative
                          </label>
                          <textarea
                            value={storeDescription}
                            onChange={(e) => setStoreDescription(e.target.value)}
                            rows={3}
                            className="w-full p-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 font-sans"
                            placeholder="Detail your brand narrative, design aesthetics, and product range..."
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={() => setIsEditingStore(false)}
                            variant="outline"
                            size="sm"
                            className="border-[#412d15] hover:bg-[#412d15]/30 font-bold font-sans uppercase text-xs"
                            disabled={isSavingStore}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="premium"
                            size="sm"
                            className="font-bold font-sans uppercase text-xs px-5 shadow-glow-sm"
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
                                Save Storefront Settings
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Public Storefront Preview Card overlay */}
                  <div className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/15 p-6 md:p-8 shadow-premium relative overflow-hidden backdrop-blur-xl text-left font-sans">
                    <h3 className="font-bold text-white text-base mb-1 font-display tracking-tight">Live Storefront Card Preview</h3>
                    <p className="text-[10px] text-white/50 tracking-wider uppercase font-sans font-light mb-6 border-b border-[#412d15]/40 pb-4">
                      How your boutique profile card looks in public catalogs
                    </p>

                    <div className="flex justify-center py-4">
                      <div className="w-full max-w-sm rounded-[2.2rem] border border-[#e1dcc9]/25 bg-gradient-to-br from-[#1b120a] to-[#000] p-6 shadow-2xl relative overflow-hidden text-left group/preview">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#e1dcc9]/3 rounded-full blur-xl" />
                        
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#e1dcc9]/25 bg-[#412d15] flex items-center justify-center text-sm font-display font-semibold text-[#e1dcc9] shrink-0 shadow-lg">
                              {user?.avatar?.url ? (
                                <img src={user.avatar.url} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span>{getInitials(user?.name)}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white tracking-tight font-display truncate max-w-[160px]">
                                {storeName || "Curated Boutique Hub"}
                              </h4>
                              <p className="text-[9px] text-[#e1dcc9]/75 font-mono uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 animate-pulse" />
                                {vendorLocation || "Bandra, Mumbai"}
                              </p>
                            </div>
                          </div>
                          
                          <span className="bg-[#e1dcc9]/10 border border-[#e1dcc9]/30 text-[#e1dcc9] px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase font-mono">
                            Curator
                          </span>
                        </div>

                        <p className="text-[11px] font-sans font-light text-white/60 mt-4 leading-relaxed line-clamp-3 min-h-[50px]">
                          {storeDescription || "Detail your brand heritage, handpicked boutique ranges, and curate catalog items..."}
                        </p>

                        <div className="w-full h-[1px] bg-[#412d15]/40 my-4" />
                        
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-[#e1dcc9]/50 font-bold font-sans">
                          <span>0 items catalogued</span>
                          <span className="text-[#e1dcc9] hover:underline flex items-center gap-1 cursor-pointer">
                            View boutique <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3 (ADMIN SPECIAL): MERCHANT DIRECTORY OVERSIGHT CONSOLE */}
              {user?.role === "admin" && activeTab === "oversight" && (
                <motion.div
                  key="tab-oversight"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="glass-card rounded-[2rem] border border-[#e1dcc9]/10 bg-[#1f150c]/15 p-6 md:p-10 shadow-premium relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-[#e1dcc9]/3 to-transparent blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#412d15]/40 relative z-10 font-display">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/15 flex items-center justify-center shadow-inner">
                        <Store className="w-5 h-5 text-[#e1dcc9]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base tracking-tight">Merchant Administration</h3>
                        <p className="text-[10px] text-white/50 tracking-wider uppercase font-sans font-light">Approve and regulate boutique curators</p>
                      </div>
                    </div>

                    <Button
                      onClick={fetchSellers}
                      variant="outline"
                      size="sm"
                      className="p-2.5 border-[#412d15] hover:bg-[#412d15]/30 text-xs shrink-0 bg-black/25 hover:text-[#e1dcc9] font-sans"
                      disabled={isFetchingSellers}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSellers ? "animate-spin" : ""}`} />
                    </Button>
                  </div>

                  {/* Filter and search bar */}
                  <div className="relative mb-6 z-10 font-sans">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={sellersSearchQuery}
                      onChange={(e) => setSellersSearchQuery(e.target.value)}
                      placeholder="Search merchants by brand name, curator email, dispatch locations..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#412d15]/50 bg-black/35 text-xs text-white placeholder:text-[#e1dcc9]/25 focus:outline-none focus:border-[#e1dcc9]/40 focus:ring-1 focus:ring-[#e1dcc9]/20 font-sans"
                    />
                  </div>

                  {/* Merchants List */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin relative z-10 font-sans text-left">
                    {isFetchingSellers && sellersList.length === 0 ? (
                      <div className="flex justify-center items-center py-12">
                        <span className="w-6 h-6 border-2 border-[#e1dcc9]/30 border-t-[#e1dcc9] rounded-full animate-spin" />
                      </div>
                    ) : filteredSellers.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-[#412d15]/50 rounded-2xl bg-black/10">
                        <AlertCircle className="w-8 h-8 text-[#e1dcc9]/40 mx-auto mb-3" />
                        <p className="text-xs text-white/50 font-sans font-light">No boutique merchants match your filter parameters.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#412d15]/30 space-y-2">
                        {filteredSellers.map((seller) => (
                          <div
                            key={seller._id}
                            onClick={() => setSelectedSeller(seller)}
                            className="pt-3 pb-3 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#412d15]/20 rounded-xl px-4 transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1f150c] border border-[#e1dcc9]/20 flex items-center justify-center shrink-0">
                                {seller.avatar?.url ? (
                                  <img 
                                    src={seller.avatar.url} 
                                    alt={seller.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-semibold text-[#e1dcc9] font-display tracking-normal">
                                    {getInitials(seller.name)}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#e1dcc9] transition-colors uppercase tracking-wider font-sans">
                                  {seller.storeName || seller.name}
                                </h4>
                                <p className="text-[10px] text-white/50 truncate font-light font-sans flex items-center gap-1.5 mt-0.5">
                                  <span>{seller.name}</span>
                                  <span>&bull;</span>
                                  <span className="text-[#e1dcc9]/50 font-mono text-[9px]">{seller.email}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3.5 shrink-0 text-[10px]">
                              {seller.isVendorApproved ? (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-[8px] rounded uppercase tracking-wide font-mono">Approved</span>
                              ) : (
                                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 text-[8px] rounded uppercase tracking-wide animate-pulse font-mono">Pending</span>
                              )}
                              {seller.isActive ? (
                                <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 border border-blue-500/20 text-[8px] rounded uppercase tracking-wide font-mono">Active</span>
                              ) : (
                                <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 border border-red-500/20 text-[8px] rounded uppercase tracking-wide font-mono">Suspended</span>
                              )}
                              <Eye className="w-4 h-4 text-[#e1dcc9]/40 group-hover:text-white transition-colors ml-1" />
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

      {/* Boutique Avatar Selector Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="glass-card w-full max-w-lg rounded-[2.2rem] border border-[#e1dcc9]/25 bg-[#170e06] p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)] relative text-left"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#412d15]/50 mb-6">
                <div>
                  <span className="inline-flex rounded-full border border-[#e1dcc9]/10 bg-[#e1dcc9]/5 px-2 py-0.5 text-[8px] uppercase tracking-widest text-[#e1dcc9]/85 mb-1 font-semibold">
                    Visual Identity
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white font-display">
                    Select Boutique Avatar
                  </h3>
                </div>
                <button
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-black/45 border border-[#412d15] flex items-center justify-center text-[#e1dcc9]/60 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Standard Avatar Selection Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {PRESETS_AVATARS.map((av, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectAvatarUrl(av.url)}
                      className="group/avatar-item cursor-pointer flex flex-col items-center gap-1.5"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover/avatar-item:border-[#e1dcc9] transition-all relative">
                        <img 
                          src={av.url} 
                          alt={av.name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar-item:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover/avatar-item:opacity-0 transition-opacity" />
                      </div>
                      <span className="text-[9px] text-white/40 uppercase tracking-widest truncate max-w-full font-mono">{av.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full h-[1px] bg-[#412d15]/40" />

                {/* Custom Avatar Url Form */}
                <div className="space-y-2 text-xs">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/60 font-mono">
                    Custom Image URL Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="Paste image URL here (e.g. from unsplash)..."
                      className="flex-1 h-11 px-4 rounded-xl border border-[#412d15]/50 bg-black/45 text-xs text-white placeholder:text-[#e1dcc9]/20 focus:outline-none"
                    />
                    <Button 
                      onClick={() => customAvatarUrl.trim() && handleSelectAvatarUrl(customAvatarUrl.trim())}
                      variant="glow"
                      className="text-xs font-bold font-sans uppercase"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Platform Oversight Detail Modal Overlay (For Admins) */}
      <AnimatePresence>
        {selectedSeller && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="glass-card w-full max-w-lg rounded-[2.2rem] border border-[#e1dcc9]/20 bg-[#1f150c] p-6 md:p-8 shadow-[0_32px_90px_rgba(0,0,0,0.9)] relative overflow-y-auto max-h-[85vh] text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#412d15]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start pb-4 border-b border-[#412d15]/50 mb-6">
                <div>
                  <span className="inline-flex rounded-full border border-[#e1dcc9]/10 bg-[#e1dcc9]/5 px-2.5 py-0.5 text-[8px] uppercase tracking-widest text-[#e1dcc9]/85 mb-1.5 font-semibold">
                    Merchant Dossier
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white font-display">
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
                {/* Avatar summary node */}
                <div className="flex items-center gap-4 bg-black/45 border border-[#412d15]/40 rounded-2xl p-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#412d15] to-[#1f150c] border border-[#e1dcc9]/30 flex items-center justify-center font-display text-lg tracking-normal text-[#e1dcc9]">
                    {selectedSeller.avatar?.url ? (
                      <img 
                        src={selectedSeller.avatar.url} 
                        alt={selectedSeller.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(selectedSeller.name)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white font-display">
                      {selectedSeller.name}
                    </h4>
                    <p className="text-xs text-white/50 font-light flex items-center gap-1.5 mt-0.5 font-sans">
                      <Mail className="w-3.5 h-3.5 text-[#e1dcc9]/60" />
                      {selectedSeller.email}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                    Boutique Location
                  </span>
                  <p className="text-xs font-semibold text-white bg-black/45 border border-[#412d15]/30 rounded-xl px-4 py-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#e1dcc9]/70" />
                    {selectedSeller.vendorLocation || "Not Configured (Mumbai local default)"}
                  </p>
                </div>

                {/* Store Description */}
                {selectedSeller.storeDescription && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 font-mono">
                      Boutique Narrative
                    </span>
                    <p className="text-xs leading-relaxed text-white/80 bg-black/45 border border-[#412d15]/30 rounded-xl px-4 py-3 font-light max-h-[96px] overflow-y-auto scrollbar-thin font-sans">
                      {selectedSeller.storeDescription}
                    </p>
                  </div>
                )}

                {/* Platform metrics status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/45 border border-[#412d15]/30 rounded-xl p-3.5 text-center">
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 mb-1">
                      Storefront Credentials
                    </span>
                    {selectedSeller.isVendorApproved ? (
                      <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400 animate-pulse font-mono">
                        Under Review
                      </span>
                    )}
                  </div>
                  <div className="bg-black/45 border border-[#412d15]/30 rounded-xl p-3.5 text-center">
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-[#e1dcc9]/40 mb-1">
                      Access Status
                    </span>
                    {selectedSeller.isActive ? (
                      <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-blue-400 font-mono">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-red-400 font-mono">
                        Suspended
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons controls */}
                <div className="border-t border-[#412d15]/50 pt-5 mt-2 flex flex-col gap-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#e1dcc9]/45 px-1 font-mono">
                    Merchant Governance Controls
                  </p>

                  <div className="flex gap-3">
                    {/* Toggle storefront approval */}
                    {selectedSeller.isVendorApproved ? (
                      <Button
                        onClick={() => handleSuspendSeller(selectedSeller._id)}
                        variant="outline"
                        className="flex-1 text-xs font-bold font-sans uppercase border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-400 gap-1.5"
                        disabled={isUpdatingSellerStatus}
                      >
                        <Lock className="w-4 h-4" />
                        Suspend Store
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApproveSeller(selectedSeller._id)}
                        variant="premium"
                        className="flex-1 text-xs font-bold font-sans uppercase gap-1.5"
                        disabled={isUpdatingSellerStatus}
                      >
                        <Check className="w-4 h-4" />
                        Approve Store
                      </Button>
                    )}

                    {/* Toggle Account active status */}
                    <Button
                      onClick={() => handleToggleSellerActive(selectedSeller._id)}
                      variant="outline"
                      className={`flex-1 text-xs font-bold font-sans uppercase border-[#412d15] hover:bg-[#412d15]/30 gap-1.5 ${
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
