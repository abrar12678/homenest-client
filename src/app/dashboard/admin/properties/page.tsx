"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HiSearch,
  HiTrash,
  HiCheckCircle,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiPhotograph,
} from "react-icons/hi";
import { toast } from "react-toastify";
import {
  getAdminProperties,
  updatePropertyStatus,
  deleteAdminProperty,
} from "@/lib/api";
import { formatDate, formatNumber, getPropertyTypeLabel } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { IProperty } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

const STATUS_TABS = ["all", "pending", "approved", "rejected"] as const;

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"}>({open: false, title: "", message: "", onConfirm: () => {}});

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (search.trim()) params.search = search.trim();
      if (statusTab !== "all") params.status = statusTab;
      const res = await getAdminProperties(params);
      const data = res.data.data || res.data;
      setProperties(data.properties || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }, [search, statusTab, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperties();
  }, [fetchProperties]);

  const handleStatus = async (propertyId: string, status: string) => {
    try {
      setActionLoading(propertyId);
      await updatePropertyStatus(propertyId, status);
      toast.success(`Property ${status} successfully.`);
      fetchProperties();
    } catch {
      toast.error("Failed to update property status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (propertyId: string, title: string) => {
    setConfirmState({
      open: true,
      title: "Delete Property",
      message: `Delete "${title}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          setActionLoading(propertyId);
          await deleteAdminProperty(propertyId);
          toast.success("Property deleted successfully.");
          fetchProperties();
        } catch {
          toast.error("Failed to delete property.");
        } finally {
          setActionLoading(null);
        }
        setConfirmState((s) => ({...s, open: false}));
      },
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  const getPostedByName = (postedBy: IProperty["postedBy"]): string => {
    if (!postedBy) return "Unknown";
    if (typeof postedBy === "string") return postedBy;
    return postedBy.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Property Moderation</h1>
        <p className="text-sm text-muted mt-1">Review, approve, reject, or remove property listings</p>
      </motion.div>

      {/* Filter Tabs + Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" as const }}
        className="space-y-4"
      >
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusTab(tab); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                statusTab === tab
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-white text-muted border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search properties by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-md pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" as const }}
        className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
      >
        {loading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiPhotograph className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-1">No properties found</h3>
            <p className="text-sm text-muted">Try adjusting your filters or search query.</p>
          </div>
        )}

        {!loading && properties.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Property</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden lg:table-cell">Type</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden md:table-cell">Posted By</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden xl:table-cell">Views</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden lg:table-cell">Date</th>
                  <th className="text-right py-3.5 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p, idx) => {
                  const thumb = p.images?.[0] || "";
                  return (
                    <motion.tr
                      key={p._id}
                      custom={idx}
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                            {thumb ? (
                              <Image src={thumb} alt={p.title} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <HiPhotograph className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-dark truncate max-w-[200px]">{p.title}</p>
                            <p className="text-xs text-muted md:hidden capitalize">{p.propertyType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell capitalize text-muted">{getPropertyTypeLabel(p.propertyType)}</td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-muted">{getPostedByName(p.postedBy)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${statusBadge(p.status || "pending")}`}>
                          {p.status || "pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden xl:table-cell">
                        <div className="flex items-center gap-1 text-muted">
                          <HiEye className="w-3.5 h-3.5" />
                          <span className="text-xs">{formatNumber(p.views)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted text-xs hidden lg:table-cell">{formatDate(p.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {p.status !== "approved" && (
                            <button
                              onClick={() => handleStatus(p._id, "approved")}
                              disabled={actionLoading === p._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {actionLoading === p._id ? (
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <HiCheckCircle className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                          )}
                          {p.status !== "rejected" && (
                            <button
                              onClick={() => handleStatus(p._id, "rejected")}
                              disabled={actionLoading === p._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <HiX className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            disabled={actionLoading === p._id}
                            title="Delete property"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <HiTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && properties.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-muted">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
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