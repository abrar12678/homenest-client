"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiCheckCircle,
  HiX,
  HiSearch,
  HiEye,
} from "react-icons/hi";
import { getMyVisits, cancelMyVisit } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { IVisit } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

/* ─── Constants ─── */

const ITEMS_PER_PAGE = 6;

const STATUS_CONFIG: Record<string, { label: string; icon: typeof HiCheckCircle; bg: string; text: string; dot: string }> = {
  pending: { label: "Pending", icon: HiClock, bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", icon: HiCheckCircle, bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  completed: { label: "Completed", icon: HiCheckCircle, bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", icon: HiX, bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

/* ─── Animation Variants ─── */

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

/* ─── Component ─── */

export default function MyVisitsPage() {
  const [visits, setVisits] = useState<IVisit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"; loading?: boolean}>({open: false, title: "", message: "", onConfirm: () => {}});

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  /* ── Fetch ── */

  const fetchVisits = useCallback(async (page: number, status?: string) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      };
      if (status && status !== "all") params.status = status;

      const res = await getMyVisits(params);
      const data = res.data?.data;
      if (data) {
        setVisits(Array.isArray(data) ? data : data.visits || []);
        setTotalCount(data.total ?? (Array.isArray(data) ? data.length : 0));
      }
    } catch {
      toast.error("Failed to load your visits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVisits(currentPage, filter);
  }, [currentPage, filter, fetchVisits]);

  /* ── Cancel Visit ── */

  const handleCancel = (visitId: string) => {
    setConfirmState({
      open: true,
      title: "Cancel Visit",
      message: "Are you sure you want to cancel this visit?",
      confirmText: "Cancel Visit",
      variant: "danger",
      onConfirm: async () => {
        setCancellingId(visitId);
        try {
          await cancelMyVisit(visitId);
          toast.success("Visit cancelled successfully.");
          fetchVisits(currentPage, filter);
        } catch {
          // Error handled by interceptor
        } finally {
          setCancellingId(null);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  /* ── Pagination ── */

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  /* ── Counts per status ── */
  const statusCounts = visits.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  /* ── Render ── */

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <HiCalendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-dark">My Visits</h1>
              {!loading && totalCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-600">
                  {totalCount}
                </span>
              )}
            </div>
            <p className="text-sm text-muted">Track your scheduled property visits</p>
          </div>
        </div>
      </motion.div>

      {/* ── Filter Tabs ── */}
      {!loading && visits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => {
            const cfg = STATUS_CONFIG[s];
            const isActive = filter === s;
            const label = s === "all" ? `All (${totalCount})` : `${cfg?.label || s} (${statusCounts[s] || 0})`;
            return (
              <button
                key={s}
                onClick={() => { setFilter(s); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-white text-muted border border-slate-200 hover:text-dark hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <div className="flex gap-4">
                <Skeleton width={120} height={90} borderRadius={12} />
                <div className="flex-1 space-y-2">
                  <Skeleton height={18} width="70%" />
                  <Skeleton height={14} width="50%" />
                  <Skeleton height={14} width="40%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && visits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="bg-white rounded-2xl border border-slate-100 p-10 md:p-16 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiCalendar className="w-10 h-10 text-emerald-300" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">
            {filter === "all" ? "No visits scheduled yet" : `No ${filter} visits`}
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Found a property you like? Schedule a visit and track all your appointments here.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all duration-300 text-sm cursor-pointer"
          >
            <HiSearch className="w-4 h-4" />
            Browse Properties
          </Link>
        </motion.div>
      )}

      {/* ── Visits List ── */}
      {!loading && visits.length > 0 && (
        <div className="space-y-4">
          {visits.map((visit, idx) => {
            const statusCfg = STATUS_CONFIG[visit.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            const canCancel = visit.status === "pending" || visit.status === "confirmed";

            return (
              <motion.div
                key={visit._id}
                custom={idx}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Property Image */}
                    <div className="relative w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {visit.propertyImage ? (
                        <Image
                          src={visit.propertyImage}
                          alt={visit.propertyTitle}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <HiEye className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/properties/${visit.propertyId}`}
                            className="text-sm font-bold text-dark hover:text-primary transition-colors line-clamp-1 cursor-pointer block"
                          >
                            {visit.propertyTitle || "Property"}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted">
                              <HiCalendar className="w-3.5 h-3.5" />
                              <span className="font-medium text-dark">{visit.preferredDate}</span>
                            </div>
                            {visit.preferredTime && (
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <HiClock className="w-3.5 h-3.5" />
                                <span>{visit.preferredTime}</span>
                              </div>
                            )}
                          </div>
                          {visit.message && (
                            <p className="text-xs text-muted mt-1.5 line-clamp-1">
                              &ldquo;{visit.message}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text} shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Footer: Owner + Cancel */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          {visit.owner?.name && (
                            <span>Owner: <span className="font-medium text-dark">{visit.owner.name}</span></span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(visit._id)}
                              disabled={cancellingId === visit._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {cancellingId === visit._id ? (
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <HiX className="w-3.5 h-3.5" />
                              )}
                              Cancel
                            </button>
                          )}
                          <Link
                            href={`/properties/${visit.propertyId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer"
                          >
                            View Property
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1.5"
        >
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-muted bg-white border border-slate-200 hover:bg-slate-50 hover:text-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ‹
          </button>
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`dots-${idx}`} className="inline-flex items-center justify-center w-9 h-9 text-sm text-muted">…</span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page as number)}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  currentPage === page
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-muted bg-white border border-slate-200 hover:bg-slate-50 hover:text-dark"
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-muted bg-white border border-slate-200 hover:bg-slate-50 hover:text-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ›
          </button>
        </motion.div>
      )}
      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        loading={!!cancellingId}
      />
    </div>
  );
}