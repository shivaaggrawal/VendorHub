import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Tag, X, Sparkles } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  // Fetch all categories
  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ["adminCategoriesList"],
    queryFn: async () => {
      const res = await api.get("/admin/categories");
      return res.data.data;
    },
  });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/admin/categories", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategoriesList"] });
      closeModal();
      toast.success("Category model registered successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create category.");
    },
  });

  // Update Category Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/admin/categories/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategoriesList"] });
      closeModal();
      toast.success("Category model updated successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update category.");
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/admin/categories/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategoriesList"] });
      toast.success("Category model deleted successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete category.");
    },
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      slug: name === "name" ? value.trim().toLowerCase().replace(/\s+/g, "-") : prev.slug,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory._id, payload: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category? Products in this category will become uncategorized.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Dynamic Categories CRUD
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Orchestrate custom categories, assign slugs, and scale system taxonomies.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] active:scale-[0.98] transition-all font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-glow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category Model
        </button>
      </div>

      {/* Categories Grid Table */}
      <div className="bg-[#1f150c]/10 border border-[#412d15]/30 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#412d15]/30 bg-black/40 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Category ID</th>
                <th className="py-4 px-6">Name Label</th>
                <th className="py-4 px-6">System Slug</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#412d15]/10 bg-[#1f150c]/5">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-xs text-muted-foreground">
                    Fetching platform categories list...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-4">
                    <QueryErrorPlaceholder error={error} refetch={refetch} message="Failed to load platform categories." />
                  </td>
                </tr>
              ) : !categories || categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-muted-foreground">
                    <Tag className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e1dcc9]" />
                    <p className="text-xs font-semibold text-foreground">No Categories Defined</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="group hover:bg-[#412d15]/20 border-b border-[#412d15]/10 transition-colors duration-300"
                  >
                    <td className="py-4 px-6 text-[10px] text-muted-foreground font-mono">
                      {cat._id}
                    </td>
                    <td className="py-4 px-6 font-bold text-foreground">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#e1dcc9]/80 font-mono">
                      {cat.slug}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2 rounded-lg bg-[#412d15]/30 border border-[#e1dcc9]/5 hover:bg-[#e1dcc9]/15 hover:text-[#e1dcc9] text-muted-foreground transition-all duration-200"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 rounded-lg bg-red-950/15 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground transition-all duration-200"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Category Modal */}
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
              className="bg-[#1f150c] border border-[#412d15] rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl z-10"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#412d15]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#e1dcc9]" />
                  <h3 className="text-lg font-bold text-foreground">
                    {editingCategory ? "Update Category Taxonomies" : "Register Category Model"}
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Wearables"
                    className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-[#e1dcc9]/50 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">System Slug (Generated)</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="wearables"
                    className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#e1dcc9]/50 transition-colors"
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
                    className="px-4 py-2 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] text-xs font-semibold flex items-center gap-1 shadow-glow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {editingCategory ? "Adopt taxonomy" : "Instantiate Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
