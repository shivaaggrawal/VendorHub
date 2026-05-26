import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ShoppingBag, Trash2 } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");


  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ["adminAllProducts"],
    queryFn: async () => {
      const res = await api.get("/products?limit=100");
      return res.data.data;
    },
  });


  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/products/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllProducts"] });
      toast.success("Product removed from platform successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this product from the platform?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const filteredProducts = productsData?.products?.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sellerId?.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Catalog Supervision
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor and audit all active items listed across the marketplace.
          </p>
        </div>
      </div>


      <div className="flex items-center gap-3 bg-secondary/35 border border-[#412d15]/30 rounded-xl p-3 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter catalog by product title, store..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 outline-none text-xs w-full text-foreground placeholder-muted-foreground"
        />
      </div>


      <div className="bg-[#1f150c]/10 border border-[#412d15]/30 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#412d15]/30 bg-black/40 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Store / Vendor</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#412d15]/10 bg-[#1f150c]/5">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-xs text-muted-foreground">
                    Fetching platform products catalog...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-4">
                    <QueryErrorPlaceholder error={error} refetch={refetch} message="Failed to load platform products catalog." />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-muted-foreground">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e1dcc9]" />
                    <p className="text-xs font-semibold text-foreground">No Products Listed Yet</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
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
                            className="w-10 h-10 rounded-lg object-cover border border-[#412d15]/60 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate max-w-[200px]">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                              ID: {product._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-foreground">
                        {product.sellerId?.storeName || "Premium Seller"}
                        <span className="text-[9px] text-muted-foreground block font-normal">
                          {product.sellerId?.name || "Verified Vendor"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-black/30 border border-[#e1dcc9]/10 px-2 py-0.5 rounded text-[9px] text-[#e1dcc9] font-bold">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-foreground">
                        ₹{Math.round(product.price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 font-semibold text-foreground">
                        {product.stock} units
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 rounded-lg bg-red-950/15 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground transition-all duration-200"
                          title="Audit Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
