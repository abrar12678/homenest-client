"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
  HiChatAlt,
  HiUser,
  HiOfficeBuilding,
  HiX,
  HiMail,
  HiReply,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { getAdminInquiries, deleteAdminInquiry } from "@/lib/api";
import { formatDate, truncateText } from "@/lib/utils";
import type { IAdminInquiry } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<IAdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"}>({open: false, title: "", message: "", onConfirm: () => {}});

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (search.trim()) params.search = search.trim();
      const res = await getAdminInquiries(params);
      const data = res.data.data || res.data;
      setInquiries(data.inquiries || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries();
  }, [fetchInquiries]);

  const handleDelete = (inquiryId: string, userName: string) => {
    setConfirmState({
      open: true,
      title: "Delete Inquiry",
      message: `Delete inquiry from "${userName}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          setDeletingId(inquiryId);
          await deleteAdminInquiry(inquiryId);
          toast.success("Inquiry deleted successfully.");
          fetchInquiries();
        } catch {
          toast.error("Failed to delete inquiry.");
        } finally {
          setDeletingId(null);
        }
        setConfirmState((s) => ({...s, open: false}));
      },
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const statusBadge = (status: string) => {
    if (status === "replied") return "bg-emerald-100 text-emerald-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Inquiry Management</h1>
        <p className="text-sm text-muted mt-1">View and manage all buyer-to-agent inquiries across the platform</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" as const }}
        className="relative max-w-md"
      >
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search by message or property title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" as const }}
        className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
      >
        {/* Loading */}
        {loading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && inquiries.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiChatAlt className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-1">No inquiries found</h3>
            <p className="text-sm text-muted">
              {search ? "Try adjusting your search query." : "There are no inquiries at this time."}
            </p>
          </div>
        )}

        {/* Table Content */}
        {!loading && inquiries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left py-3.5 px-4 text-muted font-medium">From</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden md:table-cell">Property</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden lg:table-cell">To Agent</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden xl:table-cell">Date</th>
                  <th className="text-right py-3.5 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq, idx) => {
                  const isExpanded = expandedId === inq._id;
                  return (
                    <Fragment key={inq._id}>
                      <motion.tr
                        custom={idx}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <HiUser className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-dark text-xs md:text-sm truncate max-w-[120px]">{inq.fromUserName}</p>
                              <p className="text-xs text-muted truncate max-w-[150px] hidden sm:block">{inq.fromUserEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <HiOfficeBuilding className="w-4 h-4 text-muted shrink-0" />
                            <span className="text-muted text-xs max-w-[160px] truncate">{inq.propertyTitle}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell text-muted text-xs">{inq.toAgentName}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${statusBadge(inq.status)}`}>
                            {inq.status || "pending"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted text-xs hidden xl:table-cell">{formatDate(inq.createdAt)}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleExpand(inq._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            >
                              {isExpanded ? <HiX className="w-3.5 h-3.5" /> : <HiMail className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline">{isExpanded ? "Close" : "View"}</span>
                            </button>
                            <button
                              onClick={() => handleDelete(inq._id, inq.fromUserName)}
                              disabled={deletingId === inq._id}
                              title="Delete inquiry"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {deletingId === inq._id ? (
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <HiTrash className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan={6} className="px-6 py-0">
                              <div className="border-t border-slate-100 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-muted mb-1">From</p>
                                    <p className="text-sm font-medium text-dark">{inq.fromUserName}</p>
                                    <p className="text-xs text-muted">{inq.fromUserEmail}</p>
                                  </div>
                                  <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-muted mb-1">Property</p>
                                    <p className="text-sm font-medium text-dark">{inq.propertyTitle}</p>
                                  </div>
                                  <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-muted mb-1">Directed To</p>
                                    <p className="text-sm font-medium text-dark">{inq.toAgentName}</p>
                                    <p className="text-xs text-muted">{formatDate(inq.createdAt)}</p>
                                  </div>
                                </div>

                                {/* Original Message */}
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Message</p>
                                  <div className="bg-primary/5 rounded-xl p-4 text-sm text-dark leading-relaxed">
                                    {inq.message}
                                  </div>
                                </div>

                                {/* Replies */}
                                {inq.replies && inq.replies.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                                      Replies ({inq.replies.length})
                                    </p>
                                    <div className="space-y-3">
                                      {inq.replies.map((reply, rIdx) => (
                                        <div key={rIdx} className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                                          <div className="flex items-center gap-2 mb-1">
                                            <HiReply className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="text-xs font-semibold text-emerald-700">{reply.repliedByName}</span>
                                            <span className="text-xs text-muted">{formatDate(reply.createdAt)}</span>
                                          </div>
                                          <p className="text-sm text-dark leading-relaxed">{reply.message}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {(!inq.replies || inq.replies.length === 0) && (
                                  <p className="text-xs text-muted italic">No replies yet.</p>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && inquiries.length > 0 && totalPages > 1 && (
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
        loading={!!deletingId}
      />
    </div>
  );
}