"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiSearch,
  HiTrash,
  HiShieldCheck,
  HiExclamationCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { toast } from "react-toastify";
import {
  getAdminUsers,
  updateAdminUserRole,
  toggleAdminBan,
  deleteAdminUser,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { IUser } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

const ROLE_OPTIONS = ["user", "agent", "admin"] as const;
const FILTER_OPTIONS = ["all", "user", "agent", "admin"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"}>({open: false, title: "", message: "", onConfirm: () => {}});
  const [banConfirmState, setBanConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"}>({open: false, title: "", message: "", onConfirm: () => {}});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "all") params.role = roleFilter;
      const res = await getAdminUsers(params);
      const data = res.data.data || res.data;
      setUsers(data.users || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      await updateAdminUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}.`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBan = (userId: string, userName: string, currentBan: boolean) => {
    const action = currentBan ? "unban" : "ban";
    setBanConfirmState({
      open: true,
      title: currentBan ? "Unban User" : "Ban User",
      message: `Are you sure you want to ${action} "${userName}"?`,
      confirmText: currentBan ? "Unban" : "Ban",
      variant: currentBan ? "info" : "warning",
      onConfirm: async () => {
        try {
          setActionLoading(userId);
          await toggleAdminBan(userId);
          toast.success(`User ${currentBan ? "unbanned" : "banned"} successfully.`);
          fetchUsers();
        } catch {
          toast.error("Failed to update ban status.");
        } finally {
          setActionLoading(null);
          setBanConfirmState(prev => ({...prev, open: false}));
        }
      },
    });
  };

  const handleDelete = (userId: string, userName: string) => {
    setConfirmState({
      open: true,
      title: "Delete User",
      message: `Are you sure you want to delete "${userName}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          setActionLoading(userId);
          await deleteAdminUser(userId);
          toast.success("User deleted successfully.");
          fetchUsers();
        } catch {
          toast.error("Failed to delete user.");
        } finally {
          setActionLoading(null);
        }
        setConfirmState((s) => ({...s, open: false}));
      },
    });
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700";
      case "agent": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const statusBadge = (banned?: boolean) =>
    banned ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-dark">User Management</h1>
        <p className="text-sm text-muted mt-1">Manage all registered users, agents, and admins</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" as const }}
        className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
      >
        <div className="relative flex-1 w-full sm:w-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
        >
          {FILTER_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All Roles" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" as const }}
        className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
      >
        {/* Loading Skeleton */}
        {loading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiSearch className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-1">No users found</h3>
            <p className="text-sm text-muted">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Table Content */}
        {!loading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Name</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden md:table-cell">Email</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Role</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden sm:table-cell">Status</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-right py-3.5 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <motion.tr
                    key={u._id}
                    custom={idx}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-dark truncate max-w-[140px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted hidden md:table-cell truncate max-w-[200px]">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={actionLoading === u._id || u.role === "admin"}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${roleBadge(u.role)} disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${statusBadge(u.isBanned)}`}>
                        {u.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleBan(u._id, u.name, !!u.isBanned)}
                          disabled={actionLoading === u._id}
                          title={u.isBanned ? "Unban user" : "Ban user"}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                            u.isBanned
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          }`}
                        >
                          {actionLoading === u._id ? (
                            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : u.isBanned ? (
                            <HiShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <HiExclamationCircle className="w-3.5 h-3.5" />
                          )}
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          disabled={actionLoading === u._id}
                          title="Delete user"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-muted">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-dark hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <HiChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-xs text-muted px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-dark hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={banConfirmState.open}
        onClose={() => setBanConfirmState((s) => ({...s, open: false}))}
        onConfirm={banConfirmState.onConfirm}
        title={banConfirmState.title}
        message={banConfirmState.message}
        confirmText={banConfirmState.confirmText}
        variant={banConfirmState.variant}
        loading={!!actionLoading}
      />
      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState((s) => ({...s, open: false}))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        loading={!!actionLoading}
      />
    </div>
  );
}