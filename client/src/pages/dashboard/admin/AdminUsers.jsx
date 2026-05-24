import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Users
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsersList"],
    queryFn: async () => {
      const res = await api.get("/admin/users?limit=100");
      return res.data.data;
    },
  });

  // Toggle user state mutation
  const toggleUserActiveMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/admin/users/${id}/toggle-active`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsersList"] });
      toast.success("User account status modified successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to toggle user status.");
    },
  });

  const handleToggle = (id) => {
    toggleUserActiveMutation.mutate(id);
  };

  const filteredUsers = usersData?.users?.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          User Account Control
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Activate/Deactivate system accounts, audit logins, and adjust buyer/seller access profiles.
        </p>
      </div>

      {/* Control row */}
      <div className="flex items-center gap-3 bg-secondary/35 border border-[#412d15]/30 rounded-xl p-3 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter users by name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 outline-none text-xs w-full text-foreground placeholder-muted-foreground"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1f150c]/10 border border-[#412d15]/30 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#412d15]/30 bg-black/40 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-6">User Account</th>
                <th className="py-4 px-6">Role Profile</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#412d15]/10 bg-[#1f150c]/5">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-xs text-muted-foreground">
                    Querying cryptographic user index...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-4">
                    <QueryErrorPlaceholder error={error} refetch={refetch} message="Failed to load platform user index." />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e1dcc9]" />
                    <p className="text-xs font-semibold text-foreground">No Users Registered</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="group hover:bg-[#412d15]/20 border-b border-[#412d15]/10 transition-colors duration-300"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-foreground truncate max-w-[200px]">
                          {u.name || "Premium Client"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                          {u.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          u.role === "admin"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : u.role === "seller"
                            ? "bg-[#e1dcc9]/10 text-[#e1dcc9] border-[#e1dcc9]/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : "bg-red-500/10 text-red-400 border-red-500/25"
                        }`}
                      >
                        {u.isActive ? "Nominal / Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggle(u._id)}
                        disabled={u.role === "admin"}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all duration-200 active:scale-[0.98] ${
                          u.isActive
                            ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        } disabled:opacity-30 disabled:pointer-events-none`}
                      >
                        {u.isActive ? "Deactivate Account" : "Activate Account"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
