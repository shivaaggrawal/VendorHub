import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  X,
  Sparkles,
  Layers,
  Image as ImageIcon,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";
import api from "../../../services/api";

export default function SellerProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrls: "",
    tags: "",
  });
  const [notification, setNotification] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);


  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ["sellerProducts"],
    queryFn: async () => {
      const res = await api.get("/seller/products?limit=100");
      return res.data.data;
    },
  });


  const { data: categories } = useQuery({
    queryKey: ["formCategories"],
    queryFn: async () => {
      const res = await api.get("/products/categories");
      return res.data.data;
    },
  });


  const createProductMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/products", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
      showNotification("Product listed successfully!", "success");
      closeModal();
    },
    onError: (err) => {
      showNotification(err.response?.data?.message || "Failed to create product.", "error");
    },
  });


  const updateProductMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/products/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
      showNotification("Product updated successfully!", "success");
      closeModal();
    },
    onError: (err) => {
      showNotification(err.response?.data?.message || "Failed to update product.", "error");
    },
  });


  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/products/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
      showNotification("Product deleted.", "success");
    },
    onError: (err) => {
      showNotification(err.response?.data?.message || "Failed to delete product.", "error");
    },
  });

  const showNotification = (message, type) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      category: categories?.[0]?._id || "",
      imageUrls: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      tags: "tech, accessories, premium",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || product.category || "",
      imageUrls: product.images?.map((img) => img.url).join(", ") || "",
      tags: product.tags?.join(", ") || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();


    const parsedImages = formData.imageUrls
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .map((url) => ({ public_id: `manual_${Date.now()}`, url }));

    const parsedTags = formData.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      tags: parsedTags,
    };


    if (parsedImages.length > 0) {
      payload.images = parsedImages;
    } else {
      payload.images = [{
        public_id: "default",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
      }];
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, payload });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    setProductToDelete(id);
  };


  const filteredProducts = productsData?.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Inventory & Catalog
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your listings, adjust pricing, and track live stock updates.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] active:scale-[0.98] transition-all font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-glow-sm"
        >
          <Plus className="w-4 h-4" /> Add Premium Product
        </button>
      </div>


      <div className="flex items-center gap-3 bg-secondary/35 border border-[#412d15]/30 rounded-xl p-3 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter products by title, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 outline-none text-xs w-full text-foreground placeholder-muted-foreground"
        />
      </div>


      <div className="bg-[#1f150c]/10 border border-[#412d15]/30 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#412d15]/30 bg-black/40 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#412d15]/10 bg-[#1f150c]/5">
              {error ? (
                <tr>
                  <td colSpan="5" className="p-4">
                    <QueryErrorPlaceholder
                      error={error}
                      refetch={refetch}
                      message="Failed to synchronize seller products inventory list."
                    />
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-xs text-muted-foreground">
                    <div className="flex justify-center gap-2 items-center">
                      <div className="w-4 h-4 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
                      Fetching luxury inventory...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e1dcc9]" />
                    <p className="text-xs font-semibold text-foreground">No Premium Products Listed Yet</p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground/60">Tap "Add Premium Product" to launch your store catalog.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.stock <= 5;
                  const firstImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80";

                  return (
                    <tr
                      key={product._id}
                      className="group hover:bg-[#412d15]/20 border-b border-[#412d15]/10 transition-colors duration-300"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={firstImage}
                            alt={product.title}
                            className="w-12 h-12 rounded-xl object-cover border border-[#412d15]/60 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate max-w-[200px]">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-muted-foreground font-medium">
                        <span className="bg-black/30 border border-[#e1dcc9]/10 px-2 py-1 rounded-md text-[10px] text-[#e1dcc9] font-bold">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-foreground">
                        ₹{Math.round(product.price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLowStock
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                          {product.stock} in stock {isLowStock && "(Low)"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 rounded-lg bg-[#412d15]/30 border border-[#e1dcc9]/5 hover:bg-[#e1dcc9]/15 hover:text-[#e1dcc9] text-muted-foreground transition-all duration-200"
                            title="Edit Listing"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 rounded-lg bg-red-950/15 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground transition-all duration-200"
                            title="Delete/Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1f150c] border border-[#412d15] rounded-3xl w-full max-w-xl p-6 relative overflow-hidden shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >

              <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#412d15]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#e1dcc9]" />
                  <h3 className="text-lg font-bold text-foreground">
                    {editingProduct ? "Refine Product Listing" : "Launch Premium Listing"}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-lg bg-black/35 hover:bg-black/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>


              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Product Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Carbon Fiber Wireless Audio"
                      className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-[#e1dcc9]/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Category</label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#e1dcc9]/50 transition-colors"
                    >
                      {categories?.map((cat) => (
                        <option key={cat._id} value={cat._id} className="bg-[#1f150c] text-foreground">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Description</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a cinematic, rich description of this luxury product..."
                    rows="3"
                    className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-[#e1dcc9]/50 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Simulate Retail Price (₹)</label>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-3" />
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="199.99"
                        className="w-full bg-black/40 border border-[#412d15] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-[#e1dcc9]/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="100"
                      className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-[#e1dcc9]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-muted-foreground" /> Image URLs (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="imageUrls"
                    value={formData.imageUrls}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-[#e1dcc9]/50 transition-colors"
                  />
                  <span className="text-[9px] text-muted-foreground/60 block mt-0.5">
                    Separating multiple URLs by commas creates an interactive multi-image media carousel.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                    <Layers className="w-3 h-3 text-muted-foreground" /> Searchable Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="accessories, luxury, premium"
                    className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-[#e1dcc9]/50 transition-colors"
                  />
                </div>


                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#412d15] mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-[#412d15] text-xs font-semibold text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] disabled:opacity-50 text-xs font-semibold flex items-center gap-1 shadow-glow-sm"
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                      <div className="w-3.5 h-3.5 border-t-2 border-black border-solid rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {editingProduct ? "Update Premium Listing" : "Adopt & Launch"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1f150c] border border-red-500/20 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl z-10 text-center"
            >

              <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>

              <h3 className="text-base font-bold text-white uppercase tracking-wider font-oswald">
                Archive Product Listing
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
                Are you sure you want to deactivate and archive this luxury product listing? You can safely reactivate it anytime through the platform administrative hub.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#412d15] text-xs font-semibold text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProductMutation.mutate(productToDelete);
                    setProductToDelete(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white active:scale-[0.98] transition-all font-semibold text-xs"
                >
                  Confirm Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
