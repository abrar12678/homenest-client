"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  HiMail,
  HiPhone,
  HiCurrencyDollar,
  HiCheck,
  HiX,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiSparkles,
  HiCash,
  HiOfficeBuilding,
  HiCreditCard,
  HiTag,
  HiShieldCheck,
  HiExclamationCircle,
} from "react-icons/hi";

import {
  getSellerDeals,
  counterOffer,
  acceptDeal,
  rejectDeal,
  completeDeal,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { IDeal, DealStatus, IDealHistoryEntry } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";

// ─── Constants ───────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6;

type TabFilter =
  | "all"
  | "pending"
  | "countered"
  | "payment"
  | "completed"
  | "rejected";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

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

// ─── Status Config ───────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DealStatus,
  { bg: string; text: string; dot: string; label: string; icon: React.ReactNode }
> = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Pending",
    icon: <HiExclamationCircle className="w-3.5 h-3.5" />,
  },
  countered: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Negotiating",
    icon: <HiChevronRight className="w-3.5 h-3.5" />,
  },
  accepted: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Accepted",
    icon: <HiCheck className="w-3.5 h-3.5" />,
  },
  payment_pending: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "Payment Pending",
    icon: <HiCreditCard className="w-3.5 h-3.5" />,
  },
  payment_verified: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    dot: "bg-cyan-500",
    label: "Payment Verified",
    icon: <HiShieldCheck className="w-3.5 h-3.5" />,
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Completed",
    icon: <HiSparkles className="w-3.5 h-3.5" />,
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Rejected",
    icon: <HiExclamationCircle className="w-3.5 h-3.5" />,
  },
};

const FINANCING_CONFIG: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  cash: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <HiCash className="w-3.5 h-3.5" />,
    label: "Cash",
  },
  bank_transfer: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: <HiOfficeBuilding className="w-3.5 h-3.5" />,
    label: "Bank Transfer",
  },
  loan: {
    bg: "bg-violet-50 border-violet-200",
    text: "text-violet-700",
    icon: <HiCurrencyDollar className="w-3.5 h-3.5" />,
    label: "Loan",
  },
  mortgage: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: <HiCreditCard className="w-3.5 h-3.5" />,
    label: "Mortgage",
  },
};

// ─── History Timeline Config ─────────────────────────────────────────

const HISTORY_ACTION_LABELS: Record<IDealHistoryEntry["action"], string> = {
  offer_made: "Offer Made",
  countered: "Counter Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  payment_submitted: "Payment Submitted",
  payment_verified: "Payment Verified",
  completed: "Deal Completed",
  withdrawn: "Withdrawn",
};

const HISTORY_ACTION_COLORS: Record<
  IDealHistoryEntry["action"],
  { dot: string; ring: string }
> = {
  offer_made: { dot: "bg-blue-500", ring: "ring-blue-200" },
  countered: { dot: "bg-amber-500", ring: "ring-amber-200" },
  accepted: { dot: "bg-emerald-500", ring: "ring-emerald-200" },
  rejected: { dot: "bg-red-500", ring: "ring-red-200" },
  payment_submitted: { dot: "bg-purple-500", ring: "ring-purple-200" },
  payment_verified: { dot: "bg-cyan-500", ring: "ring-cyan-200" },
  completed: { dot: "bg-green-500", ring: "ring-green-200" },
  withdrawn: { dot: "bg-slate-500", ring: "ring-slate-200" },
};

// ─── Spinner ─────────────────────────────────────────────────────────

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function SellerDealsPage() {
  const [deals, setDeals] = useState<IDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());

  // Action loading state
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  // Counter-offer modal
  const [counterModal, setCounterModal] = useState<{
    open: boolean;
    dealId: string;
    currentAmount: number;
  }>({ open: false, dealId: "", currentAmount: 0 });
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    dealId: string;
  }>({ open: false, dealId: "" });
  const [rejectReason, setRejectReason] = useState("");

  // Confirm modal state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: "danger" | "warning" | "info";
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // ─── Fetch Deals ──────────────────────────────────────────────────

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      };
      if (activeTab !== "all") {
        if (activeTab === "payment") {
          params.status = "payment_pending,payment_verified";
        } else {
          params.status = activeTab;
        }
      }
      const res = await getSellerDeals(params);
      const data = res?.data?.data;
      const items = data?.deals || data || [];
      setDeals(Array.isArray(items) ? items : []);
      setTotalPages(
        data?.totalPages ||
          Math.ceil((Array.isArray(items) ? items.length : 0) / ITEMS_PER_PAGE) ||
          1
      );
      if (data?.total !== undefined) setTotalCount(data.total);
      if (data?.statusCounts) setStatusCounts(data.statusCounts);
    } catch {
      toast.error("Failed to load deals.");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // ─── Helper: Set action loading ───────────────────────────────────

  const withLoading = useCallback(
    async (dealId: string, fn: () => Promise<void>) => {
      setActionLoading((prev) => new Set(prev).add(dealId));
      try {
        await fn();
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev);
          next.delete(dealId);
          return next;
        });
      }
    },
    []
  );

  // ─── Actions ──────────────────────────────────────────────────────

  const handleAccept = useCallback(
    (dealId: string) => {
      setConfirmState({
        open: true,
        title: "Accept Offer",
        message: "Are you sure you want to accept this offer? This will confirm the deal terms and the buyer will proceed to payment.",
        confirmText: "Accept Offer",
        variant: "info",
        onConfirm: async () => {
          await withLoading(dealId, async () => {
            await acceptDeal(dealId);
            toast.success("Offer accepted successfully!");
            setDeals((prev) =>
              prev.map((d) =>
                d._id === dealId ? { ...d, status: "accepted" as DealStatus } : d
              )
            );
            setConfirmState((prev) => ({ ...prev, open: false }));
            fetchDeals();
          });
        },
      });
    },
    [withLoading, fetchDeals]
  );

  const handleVerifyPayment = useCallback(
    (dealId: string) => {
      setConfirmState({
        open: true,
        title: "Verify Payment",
        message: "Have you verified the buyer's payment? This action confirms the payment is valid and the deal moves to the final step.",
        confirmText: "Verify Payment",
        variant: "info",
        onConfirm: async () => {
          await withLoading(dealId, async () => {
            await acceptDeal(dealId);
            toast.success("Payment verified successfully!");
            setDeals((prev) =>
              prev.map((d) =>
                d._id === dealId
                  ? { ...d, status: "payment_verified" as DealStatus }
                  : d
              )
            );
            setConfirmState((prev) => ({ ...prev, open: false }));
            fetchDeals();
          });
        },
      });
    },
    [withLoading, fetchDeals]
  );

  const handleComplete = useCallback(
    (dealId: string) => {
      setConfirmState({
        open: true,
        title: "Mark as Completed",
        message: "This will finalize the sale and mark the deal as completed. This action cannot be undone.",
        confirmText: "Complete Deal",
        variant: "warning",
        onConfirm: async () => {
          await withLoading(dealId, async () => {
            await completeDeal(dealId);
            toast.success("Deal marked as completed!");
            setDeals((prev) =>
              prev.map((d) =>
                d._id === dealId
                  ? { ...d, status: "completed" as DealStatus }
                  : d
              )
            );
            setConfirmState((prev) => ({ ...prev, open: false }));
            fetchDeals();
          });
        },
      });
    },
    [withLoading, fetchDeals]
  );

  const handleOpenCounter = useCallback((deal: IDeal) => {
    setCounterModal({
      open: true,
      dealId: deal._id,
      currentAmount: deal.finalAmount || deal.offerAmount,
    });
    setCounterAmount("");
    setCounterMessage("");
  }, []);

  const handleSubmitCounter = useCallback(async () => {
    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.warning("Please enter a valid counter-offer amount.");
      return;
    }
    const dealId = counterModal.dealId;
    await withLoading(dealId, async () => {
      await counterOffer(dealId, {
        amount,
        message: counterMessage.trim() || "Counter offer submitted.",
      });
      toast.success("Counter-offer submitted!");
      setCounterModal({ open: false, dealId: "", currentAmount: 0 });
      setCounterAmount("");
      setCounterMessage("");
      fetchDeals();
    });
  }, [counterAmount, counterMessage, counterModal.dealId, withLoading, fetchDeals]);

  const handleOpenReject = useCallback((dealId: string) => {
    setRejectModal({ open: true, dealId });
    setRejectReason("");
  }, []);

  const handleConfirmReject = useCallback(async () => {
    const dealId = rejectModal.dealId;
    await withLoading(dealId, async () => {
      await rejectDeal(dealId, {
        reason: rejectReason.trim() || undefined,
      });
      toast.success("Deal rejected.");
      setRejectModal({ open: false, dealId: "" });
      setRejectReason("");
      fetchDeals();
    });
  }, [rejectModal.dealId, rejectReason, withLoading, fetchDeals]);

  // ─── Toggle History ───────────────────────────────────────────────

  const toggleHistory = useCallback((dealId: string) => {
    setExpandedHistory((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  }, []);

  // ─── Computed Values ──────────────────────────────────────────────

  const pendingCount = statusCounts?.pending ?? 0;
  const counteredCount = statusCounts?.countered ?? 0;
  const paymentCount =
    (statusCounts?.payment_pending ?? 0) + (statusCounts?.payment_verified ?? 0);
  const completedCount = statusCounts?.completed ?? 0;
  const rejectedCount = statusCounts?.rejected ?? 0;

  const tabs: { label: string; value: TabFilter; count?: number }[] = [
    { label: "All", value: "all", count: totalCount || undefined },
    { label: "Pending", value: "pending", count: pendingCount || undefined },
    { label: "Negotiating", value: "countered", count: counteredCount || undefined },
    { label: "Payment", value: "payment", count: paymentCount || undefined },
    { label: "Completed", value: "completed", count: completedCount || undefined },
    { label: "Rejected", value: "rejected", count: rejectedCount || undefined },
  ];

  const paginationRange = useMemo(
    () => getPaginationRange(page, totalPages),
    [page, totalPages]
  );

  // ─── Render: Percentage Difference ────────────────────────────────

  const renderPercentage = (offer: number, listing: number) => {
    if (!listing || listing === 0) return null;
    const diff = ((offer - listing) / listing) * 100;
    const isDiscount = diff < 0;
    return (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
          isDiscount
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        {isDiscount ? "↓" : "↑"} {Math.abs(diff).toFixed(1)}%{" "}
        {isDiscount ? "below" : "above"} asking
      </span>
    );
  };

  // ─── Render: Status Badge ─────────────────────────────────────────

  const renderStatusBadge = (status: DealStatus) => {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  // ─── Render: Financing Badge ──────────────────────────────────────

  const renderFinancingBadge = (method: string) => {
    const cfg = FINANCING_CONFIG[method];
    if (!cfg) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${cfg.bg} ${cfg.text}`}
      >
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  // ─── Render: History Timeline ─────────────────────────────────────

  const renderHistory = (deal: IDeal) => {
    const isExpanded = expandedHistory.has(deal._id);
    const history = deal.history || [];

    return (
      <div className="mt-3">
        <button
          onClick={() => toggleHistory(deal._id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <HiChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
          Deal History ({history.length})
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-4">
                {history.map((entry, idx) => {
                  const colors =
                    HISTORY_ACTION_COLORS[entry.action] ||
                    HISTORY_ACTION_COLORS.offer_made;
                  const label =
                    HISTORY_ACTION_LABELS[entry.action] || entry.action;
                  const isLatest = idx === 0;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="relative flex gap-3"
                    >
                      {/* Dot */}
                      <div
                        className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ${colors.dot} ${isLatest ? "ring-2 " + colors.ring : ""}`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 mb-0.5">
                          <span
                            className={`text-sm font-semibold ${
                              isLatest ? "text-dark" : "text-muted"
                            }`}
                          >
                            {label}
                          </span>
                          <span className="text-[11px] text-muted whitespace-nowrap">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted/80 mb-0.5">
                          By {entry.byUserName}{" "}
                          <span className="text-muted/60">
                            ({entry.byRole})
                          </span>
                        </p>
                        {entry.amount !== undefined && entry.amount > 0 && (
                          <p className="text-xs font-medium text-dark">
                            Amount: ৳{entry.amount.toLocaleString("en-IN")}
                          </p>
                        )}
                        {entry.message && (
                          <p className="text-xs text-muted/90 mt-1 bg-slate-50 rounded-lg p-2 leading-relaxed">
                            {entry.message}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {history.length === 0 && (
                  <p className="text-xs text-muted py-2">
                    No history entries yet.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ─── Render: Action Buttons ───────────────────────────────────────

  const renderActions = (deal: IDeal) => {
    const isLoading = actionLoading.has(deal._id);

    switch (deal.status) {
      case "pending":
        return (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleAccept(deal._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <HiCheck className="w-4 h-4" />
              )}
              Accept Offer
            </button>
            <button
              onClick={() => handleOpenCounter(deal)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <HiChevronRight className="w-4 h-4" />
              Counter Offer
            </button>
            <button
              onClick={() => handleOpenReject(deal._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-red-500/20 cursor-pointer"
            >
              <HiX className="w-4 h-4" />
              Reject
            </button>
          </div>
        );

      case "countered":
        return (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleAccept(deal._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <HiCheck className="w-4 h-4" />
              )}
              Accept Counter
            </button>
            <button
              onClick={() => handleOpenCounter(deal)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <HiChevronRight className="w-4 h-4" />
              Counter Again
            </button>
            <button
              onClick={() => handleOpenReject(deal._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-red-500/20 cursor-pointer"
            >
              <HiX className="w-4 h-4" />
              Reject
            </button>
          </div>
        );

      case "accepted":
        return (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <HiExclamationCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Waiting for the buyer to submit payment details.
              </p>
            </div>
          </div>
        );

      case "payment_pending":
        return (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            {/* Payment Details */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-2">
                Buyer&apos;s Payment Details
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HiCreditCard className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-800 font-medium">
                    Method:{" "}
                    <span className="font-normal capitalize">
                      {deal.paymentMethod === "stripe" ? "Stripe (Online)" : deal.paymentMethod || "Not specified"}
                    </span>
                  </span>
                </div>
                {deal.earnestMoneyBDT ? (
                  <div className="flex items-center gap-2">
                    <HiCash className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-800 font-medium">
                      Earnest Money: <span className="font-bold">&#x09F3;{deal.earnestMoneyBDT.toLocaleString("en-IN")}</span>
                    </span>
                  </div>
                ) : null}
                {deal.stripePaymentId && (
                  <div className="flex items-center gap-2">
                    <HiTag className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-800">
                      Transaction: <span className="font-mono text-xs">{deal.stripePaymentId}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full uppercase">Paid</span>
                  </div>
                )}
                {deal.paymentNote && !deal.stripePaymentId && (
                  <div className="flex items-start gap-2">
                    <HiExclamationCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-purple-800">
                      Note: {deal.paymentNote}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {deal.paymentMethod === "stripe" && deal.stripePaymentId && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                  <HiShieldCheck className="w-4 h-4" />
                  Stripe payment confirmed on our end. Click Verify to proceed with the deal.
                </p>
              </div>
            )}
            <button
              onClick={() => handleVerifyPayment(deal._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <HiShieldCheck className="w-4 h-4" />
              )}
              Verify Payment
            </button>
          </div>
        );

      case "payment_verified":
        return (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {deal.earnestMoneyBDT && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                <HiCash className="w-4 h-4" />
                Earnest Money Received: <span className="font-bold">&#x09F3;{deal.earnestMoneyBDT.toLocaleString("en-IN")}</span>
                {deal.stripePaymentId && (
                  <span className="text-[10px] font-mono text-muted ml-auto">{deal.stripePaymentId.slice(-12)}</span>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-cyan-50 rounded-xl border border-cyan-100 flex-1 min-w-[200px]">
                <HiShieldCheck className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <p className="text-sm text-cyan-800">
                  Payment verified. Ready to finalize the sale.
                </p>
              </div>
              <button
                onClick={() => handleComplete(deal._id)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <HiSparkles className="w-4 h-4" />
                )}
                Mark as Completed
              </button>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
              <HiSparkles className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                This property has been sold. Deal finalized successfully.
              </p>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-200 text-green-800 ml-auto flex-shrink-0">
                <HiCheck className="w-3 h-3" />
                Sold
              </span>
            </div>
          </div>
        );

      case "rejected":
        return (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
              <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                This deal has been ended.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Loading Skeleton ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-40 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
        {/* Card skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse space-y-4"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded-lg" />
                  <div className="h-3 w-56 bg-slate-100 rounded-lg" />
                  <div className="h-3 w-32 bg-slate-100 rounded-lg" />
                  <div className="h-8 w-36 bg-slate-200 rounded-lg mt-2" />
                </div>
              </div>
              <div className="h-16 w-full bg-slate-100 rounded-xl" />
              <div className="flex justify-end gap-2">
                <div className="h-9 w-28 bg-slate-200 rounded-xl" />
                <div className="h-9 w-28 bg-slate-200 rounded-xl" />
                <div className="h-9 w-20 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────

  const EMPTY_MESSAGES: Record<TabFilter, { title: string; desc: string }> = {
    all: {
      title: "No deal offers yet",
      desc: "When buyers make offers on your properties, they will appear here for you to review, accept, counter, or reject.",
    },
    pending: {
      title: "No pending offers",
      desc: "There are no pending offers at the moment. New offers will show up here.",
    },
    countered: {
      title: "No negotiations in progress",
      desc: "You're not currently negotiating any deals. Counter-offered deals will appear here.",
    },
    payment: {
      title: "No payment activity",
      desc: "No deals are currently in the payment stage. When a buyer submits payment, it will appear here.",
    },
    completed: {
      title: "No completed deals",
      desc: "Completed deals will appear here once a sale is finalized.",
    },
    rejected: {
      title: "No rejected deals",
      desc: "Rejected deals will be listed here for your records.",
    },
  };

  const emptyState = EMPTY_MESSAGES[activeTab];

  // ─── Main Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-dark">
            Deal Offers
          </h1>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {pendingCount} pending
            </span>
          )}
        </div>
        <p className="text-sm text-muted">
          {totalCount > 0 ? `${totalCount} total deals` : "No deals"}
        </p>
      </motion.div>

      {/* Status Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" as const }}
        className="flex items-center gap-1.5 bg-slate-100 rounded-2xl p-1 w-fit overflow-x-auto max-w-full"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-white text-dark shadow-sm"
                  : "text-muted hover:text-dark"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-200 text-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {!loading && deals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 md:p-16 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiTag className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">
            {emptyState.title}
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            {emptyState.desc}
          </p>
        </motion.div>
      )}

      {/* Deal Cards */}
      {deals.length > 0 && (
        <div className="space-y-4">
          {deals.map((deal, idx) => {
            const displayAmount =
              deal.finalAmount || deal.offerAmount || deal.propertyPrice;

            return (
              <motion.div
                key={deal._id}
                custom={idx}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  {/* Top Row: Property + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Property Thumbnail */}
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                        {deal.propertyImage ? (
                          <Image
                            src={deal.propertyImage}
                            alt={deal.propertyTitle}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiOfficeBuilding className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/properties/${deal.propertyId}`}
                          className="text-sm font-semibold text-dark hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                        >
                          {deal.propertyTitle}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">
                          Listing Price:{" "}
                          <span className="font-medium text-dark">
                            ৳{deal.propertyPrice?.toLocaleString("en-IN")}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted/70 mt-0.5">
                          {formatDate(deal.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {renderFinancingBadge(deal.financingMethod)}
                      {renderStatusBadge(deal.status)}
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-4 px-3.5 py-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {deal.buyerName?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-dark truncate">
                        {deal.buyerName || deal.buyer?.name || "Unknown Buyer"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted min-w-0">
                      <HiMail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {deal.buyerEmail || deal.buyer?.email || "N/A"}
                      </span>
                    </div>
                    {deal.buyerPhone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <HiPhone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{deal.buyerPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Offer Amount Section */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">
                        {deal.status === "completed"
                          ? "Final Sale Price"
                          : deal.status === "countered"
                            ? "Counter Offer"
                            : "Offer Amount"}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl md:text-3xl font-bold text-dark">
                          ৳{displayAmount?.toLocaleString("en-IN")}
                        </span>
                        {renderPercentage(displayAmount, deal.propertyPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Buyer's Original Message */}
                  {deal.message && (
                    <div className="bg-slate-50 rounded-xl p-3.5 mb-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1.5">
                        Buyer&apos;s Message
                      </p>
                      <p className="text-sm text-dark/80 leading-relaxed whitespace-pre-wrap">
                        {deal.message}
                      </p>
                    </div>
                  )}

                  {/* History Timeline */}
                  {renderHistory(deal)}

                  {/* Action Buttons */}
                  {renderActions(deal)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" as const }}
          className="flex items-center justify-center gap-2 pt-2"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-dark bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <HiChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {paginationRange.map((p, idx) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-sm text-muted"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    page === p
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-muted bg-white border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-dark bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
            <HiChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── Counter-Offer Modal ──────────────────────────────────── */}
      <Modal
        isOpen={counterModal.open}
        onClose={() => setCounterModal({ open: false, dealId: "", currentAmount: 0 })}
        title="Submit Counter-Offer"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Current offer:{" "}
            <span className="font-semibold text-dark">
              ৳{counterModal.currentAmount.toLocaleString("en-IN")}
            </span>
          </p>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              Counter-Offer Amount (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">
                ৳
              </span>
              <input
                type="number"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                placeholder="Enter your counter-offer amount"
                min="1"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              Message{" "}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              placeholder="Add a note for the buyer..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() =>
                setCounterModal({
                  open: false,
                  dealId: "",
                  currentAmount: 0,
                })
              }
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCounter}
              disabled={
                actionLoading.has(counterModal.dealId) ||
                !counterAmount ||
                parseFloat(counterAmount) <= 0
              }
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              {actionLoading.has(counterModal.dealId) ? (
                <Spinner />
              ) : (
                <HiChevronRight className="w-4 h-4" />
              )}
              Submit Counter-Offer
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Reject Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, dealId: "" })}
        title="Reject Deal"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">
              Rejecting this deal will end negotiations. The buyer will be
              notified.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              Reason for Rejection{" "}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason (optional)..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModal({ open: false, dealId: "" })}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={actionLoading.has(rejectModal.dealId)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm shadow-red-500/20 cursor-pointer"
            >
              {actionLoading.has(rejectModal.dealId) ? (
                <Spinner />
              ) : (
                <HiExclamationCircle className="w-4 h-4" />
              )}
              Reject Deal
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Confirm Modal (Accept / Verify / Complete) ──────────── */}
      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() =>
          setConfirmState((prev) => ({ ...prev, open: false }))
        }
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        loading={false}
      />
    </div>
  );
}