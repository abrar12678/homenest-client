"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiTrash,
  HiStar,
  HiChevronLeft,
  HiChevronRight,
  HiChatAlt,
  HiSearch,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { getAdminReviews, deleteAdminReview } from "@/lib/api";
import { formatDate, truncateText } from "@/lib/utils";
import type { IReview } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HiStar
          key={i}
          className={`w-4 h-4 ${
            i < Math.round(rating) ? "text-amber-400" : "text-slate-200"
          }`}
        />
      ))}
      <span className="text-xs text-muted ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"}>({open: false, title: "", message: "", onConfirm: () => {}});

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (search.trim()) params.search = search.trim();
      const res = await getAdminReviews(params);
      const data = res.data.data || res.data;
      setReviews(data.reviews || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = (reviewId: string, reviewerName: string) => {
    setConfirmState({
      open: true,
      title: "Delete Review",
      message: `Delete review by "${reviewerName}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          setDeletingId(reviewId);
          await deleteAdminReview(reviewId);
          toast.success("Review deleted successfully.");
          fetchReviews();
        } catch {
          toast.error("Failed to delete review.");
        } finally {
          setDeletingId(null);
        }
        setConfirmState((s) => ({...s, open: false}));
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Review Moderation</h1>
        <p className="text-sm text-muted mt-1">Monitor and manage user reviews across all properties</p>
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
          placeholder="Search by reviewer name or property title..."
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
        {/* Loading Skeleton */}
        {loading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiChatAlt className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-1">No reviews found</h3>
            <p className="text-sm text-muted">There are no reviews to moderate at this time.</p>
          </div>
        )}

        {/* Table Content */}
        {!loading && reviews.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Property</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden md:table-cell">Reviewer</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Rating</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden lg:table-cell">Comment</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden xl:table-cell">Date</th>
                  <th className="text-right py-3.5 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, idx) => (
                  <motion.tr
                    key={r._id}
                    custom={idx}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-dark truncate max-w-[180px]">
                        {r.propertyTitle || r.propertyId}
                      </p>
                      <p className="text-xs text-muted md:hidden">{r.userName}</p>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="text-dark">{r.userName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StarDisplay rating={r.rating} />
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <p className="text-muted text-xs max-w-[250px]">
                        {truncateText(r.comment, 80)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs hidden xl:table-cell">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r._id, r.userName)}
                        disabled={deletingId === r._id}
                        title="Delete review"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === r._id ? (
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <HiTrash className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && reviews.length > 0 && totalPages > 1 && (
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