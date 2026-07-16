"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  HiCalendar,
  HiClock,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiCheck,
  HiX,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

import { getReceivedVisits, updateVisitStatus } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";
import type { IVisit } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

const ITEMS_PER_PAGE = 6;

type StatusTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const STATUS_CONFIG: Record<
  IVisit["status"],
  { bg: string; text: string; dot: string; label: string }
> = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Pending",
  },
  confirmed: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Confirmed",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Completed",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Cancelled",
  },
};

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (currentPage > 3) pages.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: i * 0.05,
      ease: "easeOut" as const,
    },
  }),
};

export default function VisitRequestsPage() {
  const [visits, setVisits] = useState<IVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"; loading?: boolean}>({open: false, title: "", message: "", onConfirm: () => {}});

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      };
      if (activeTab !== "all") params.status = activeTab;
      const res = await getReceivedVisits(params);
      const data = res?.data?.data;
      const items = data?.visits || data || [];
      setVisits(Array.isArray(items) ? items : []);
      setTotalPages(
        data?.totalPages ||
          Math.ceil((Array.isArray(items) ? items.length : 0) / ITEMS_PER_PAGE) ||
          1
      );
      if (data?.total !== undefined) setTotalCount(data.total);
      if (data?.statusCounts) {
        setStatusCounts(data.statusCounts);
      }
    } catch {
      toast.error("Failed to load visit requests.");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleStatusUpdate = (
    visitId: string,
    newStatus: string,
    actionLabel: string
  ) => {
    const variant = actionLabel === "cancel" ? "danger" as const : "info" as const;
    const confirmText = actionLabel === "confirm" ? "Confirm" : actionLabel === "cancel" ? "Cancel Visit" : "Mark Completed";
    setConfirmState({
      open: true,
      title: `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} Visit`,
      message: `Are you sure you want to ${actionLabel} this visit request?`,
      confirmText,
      variant,
      onConfirm: async () => {
        try {
          setUpdatingId(visitId);
          await updateVisitStatus(visitId, newStatus);
          toast.success(`Visit ${newStatus} successfully!`);
          setVisits((prev) =>
            prev.map((v) =>
              v._id === visitId
                ? { ...v, status: newStatus as IVisit["status"] }
                : v
            )
          );
          fetchVisits();
        } catch {
          toast.error("Failed to update visit status.");
        } finally {
          setUpdatingId(null);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const pendingCount =
    statusCounts?.pending ??
    visits.filter((v) => v.status === "pending").length;

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const getInitial = (name: string) =>
    name?.charAt(0)?.toUpperCase() || "?";

  const renderStatusBadge = (status: IVisit["status"]) => {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const renderActionButtons = (visit: IVisit) => {
    if (visit.status === "pending") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              handleStatusUpdate(visit._id, "confirmed", "confirm")
            }
            disabled={updatingId === visit._id}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <HiCheck className="w-4 h-4" />
            {updatingId === visit._id ? "Updating..." : "Confirm"}
          </button>
          <button
            onClick={() =>
              handleStatusUpdate(visit._id, "cancelled", "cancel")
            }
            disabled={updatingId === visit._id}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <HiX className="w-4 h-4" />
            Cancel
          </button>
        </div>
      );
    }

    if (visit.status === "confirmed") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              handleStatusUpdate(visit._id, "completed", "mark as completed")
            }
            disabled={updatingId === visit._id}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <HiCheckCircle className="w-4 h-4" />
            {updatingId === visit._id ? "Updating..." : "Mark Completed"}
          </button>
          <button
            onClick={() =>
              handleStatusUpdate(visit._id, "cancelled", "cancel")
            }
            disabled={updatingId === visit._id}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <HiX className="w-4 h-4" />
            Cancel
          </button>
        </div>
      );
    }

    return renderStatusBadge(visit.status);
  };

  const renderLoadingSkeleton = () =>
    Array.from({ length: 3 }).map((_, idx) => (
      <div
        key={`skeleton-${idx}`}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 animate-pulse"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-3 w-48 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="h-4 w-56 rounded bg-slate-100 mb-4" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-50" />
          ))}
        </div>
        <div className="h-16 rounded-2xl bg-slate-50 mb-4" />
        <div className="flex justify-end gap-2">
          <div className="h-9 w-24 rounded-xl bg-slate-200" />
          <div className="h-9 w-20 rounded-xl bg-slate-200" />
        </div>
      </div>
    ));

  const renderEmptyState = () => {
    const messages: Record<StatusTab, string> = {
      all: "You haven't received any visit requests yet. They will appear here when visitors schedule a visit to your properties.",
      pending: "No pending visit requests at the moment. New requests will show up here.",
      confirmed: "No confirmed visits. Confirm a pending request to see it here.",
      completed: "No completed visits yet. Completed visit records will appear here.",
      cancelled: "No cancelled visits. Cancelled visit requests will appear here.",
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-20 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-6 shadow-lg">
          <HiCalendar className="w-9 h-9 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-dark mb-2">
          No visit requests
        </h3>
        <p className="text-muted text-center max-w-md text-sm leading-relaxed">
          {messages[activeTab]}
        </p>
      </motion.div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = getPaginationRange(page, totalPages);

    return (
      <div className="flex items-center justify-center gap-1.5 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-muted hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>
        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center w-9 h-9 text-sm text-muted"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p as number)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                page === p
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-muted hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark">
              Visit Requests
            </h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingCount} Pending
              </span>
            )}
          </div>
          <span className="text-sm text-muted font-medium">
            Showing {formatNumber(visits.length)} requests
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-slate-100 rounded-2xl p-1 inline-flex gap-0.5">
          {TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? totalCount
                : tab.key === "pending"
                  ? pendingCount
                  : statusCounts?.[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white text-dark shadow-sm"
                    : "text-muted hover:text-dark"
                }`}
              >
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-slate-100 text-dark"
                        : "bg-slate-200/60 text-muted"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Visit Cards List */}
        {loading ? (
          <div className="space-y-4">{renderLoadingSkeleton()}</div>
        ) : visits.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="space-y-4">
              {visits.map((visit, index) => (
                <motion.div
                  key={visit?._id || index}
                  custom={index}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
                >
                  {/* Top row: visitor info + date + status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {getInitial(
                            visit?.visitorName || visit?.visitor?.name || ""
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark">
                          {visit?.visitorName || visit?.visitor?.name || "Unknown Visitor"}
                        </p>
                        <p className="text-xs text-muted">
                          {visit?.visitorEmail || visit?.visitor?.email || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted">
                        {visit?.preferredDate
                          ? formatDate(visit.preferredDate)
                          : ""}
                      </span>
                      {renderStatusBadge(visit?.status)}
                    </div>
                  </div>

                  {/* Property link */}
                  <Link
                    href={`/properties/${visit?.propertyId || ""}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-4"
                  >
                    <HiLocationMarker className="w-4 h-4 flex-shrink-0" />
                    {visit?.propertyTitle || "Untitled Property"}
                  </Link>

                  {/* Visit Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl">
                      <HiCalendar className="w-4 h-4 text-muted flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
                          Preferred Date
                        </p>
                        <p className="text-sm text-dark font-medium">
                          {visit?.preferredDate
                            ? formatDate(visit.preferredDate)
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl">
                      <HiClock className="w-4 h-4 text-muted flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
                          Preferred Time
                        </p>
                        <p className="text-sm text-dark font-medium">
                          {visit?.preferredTime || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl">
                      <HiPhone className="w-4 h-4 text-muted flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
                          Visitor Phone
                        </p>
                        <p className="text-sm text-dark font-medium">
                          {visit?.visitorPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl">
                      <HiMail className="w-4 h-4 text-muted flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
                          Visitor Email
                        </p>
                        <p className="text-sm text-dark font-medium">
                          {visit?.visitorEmail || visit?.visitor?.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {visit?.message && (
                    <div className="bg-slate-50 rounded-2xl p-3.5 mb-4">
                      <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5">
                        Message
                      </p>
                      <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap">
                        {visit.message}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end">
                    {renderActionButtons(visit)}
                  </div>
                </motion.div>
              ))}
            </div>
            {renderPagination()}
          </>
        )}
        <ConfirmModal
          isOpen={confirmState.open}
          onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
          onConfirm={confirmState.onConfirm}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          variant={confirmState.variant}
          loading={!!updatingId}
        />
    </div>
  );
}