"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
  HiOfficeBuilding,
  HiUser,
  HiMail,
  HiPhone,
  HiX,
  HiReply,
  HiClock,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { getAdminDeals, deleteAdminDeal } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import type { IAdminDeal, DealStatus } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

/* ─── Animation ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

/* ─── Status Config ─── */
const STATUS_BADGE: Record<DealStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  countered: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  payment_pending: "bg-purple-100 text-purple-700",
  payment_verified: "bg-cyan-100 text-cyan-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<DealStatus, string> = {
  pending: "Pending",
  countered: "Countered",
  accepted: "Accepted",
  payment_pending: "Payment Pending",
  payment_verified: "Payment Verified",
  completed: "Completed",
  rejected: "Rejected",
};

/* ─── Filter Tabs ─── */
type TabKey = "all" | "pending" | "negotiating" | "payment" | "completed" | "rejected";

interface TabDef {
  key: TabKey;
  label: string;
  statuses: DealStatus[];
}

const TABS: TabDef[] = [
  { key: "all", label: "All", statuses: [] },
  { key: "pending", label: "Pending", statuses: ["pending"] },
  { key: "negotiating", label: "Negotiating", statuses: ["countered"] },
  { key: "payment", label: "Payment", statuses: ["payment_pending", "payment_verified"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "rejected", label: "Rejected", statuses: ["rejected"] },
];

/* ─── Spinner ─── */
function Spinner({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Page ─── */
export default function AdminDealsPage() {
  const [deals, setDeals] = useState<IAdminDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: "danger" | "warning" | "info";
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  /* ─── Fetch ─── */
  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (search.trim()) params.search = search.trim();

      const tab = TABS.find((t) => t.key === activeTab);
      if (tab && tab.statuses.length === 1) {
        params.status = tab.statuses[0];
      } else if (tab && tab.statuses.length > 1) {
        params.status = tab.statuses.join(",");
      }

      const res = await getAdminDeals(params);
      const data = res.data.data || res.data;
      let fetchedDeals: IAdminDeal[] = data.deals || data.data || [];

      // Client-side filter for multi-status tabs (payment)
      if (tab && tab.statuses.length > 1) {
        fetchedDeals = fetchedDeals.filter((d: IAdminDeal) =>
          tab.statuses.includes(d.status)
        );
      }

      setDeals(fetchedDeals);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load deals.");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  /* ─── Handlers ─── */
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (dealId: string, propertyTitle: string) => {
    setConfirmState({
      open: true,
      title: "Delete Deal",
      message: `Are you sure you want to delete the deal for "${propertyTitle}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          setDeletingId(dealId);
          await deleteAdminDeal(dealId);
          toast.success("Deal deleted successfully.");
          fetchDeals();
        } catch {
          toast.error("Failed to delete deal.");
        } finally {
          setDeletingId(null);
        }
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  };

  /* ─── Helpers ─── */
  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      offer_made: "Offer Made",
      countered: "Counter Offer",
      accepted: "Accepted",
      rejected: "Rejected",
      payment_submitted: "Payment Submitted",
      payment_verified: "Payment Verified",
      completed: "Deal Completed",
      withdrawn: "Withdrawn",
    };
    return map[action] || action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const actionColor = (action: string) => {
    if (action.includes("accept") || action.includes("complet") || action.includes("verif"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (action.includes("reject") || action.includes("withdraw"))
      return "bg-red-100 text-red-700 border-red-200";
    if (action.includes("counter"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (action.includes("payment"))
      return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  /* ─── Render ─── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Deal Management</h1>
        <p className="text-sm text-muted mt-1">
          Monitor and manage all property deals, negotiations, and payments
        </p>
      </motion.div>

      {/* Search + Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" as const }}
        className="space-y-3"
      >
        {/* Search */}
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by property title, buyer name, or agent name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-dark text-white shadow-md shadow-dark/10"
                  : "bg-slate-100 text-muted hover:bg-slate-200 hover:text-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table (Desktop) / Cards (Mobile) */}
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
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && deals.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOfficeBuilding className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-1">No deals found</h3>
            <p className="text-sm text-muted">
              {search || activeTab !== "all"
                ? "Try adjusting your search or filter criteria."
                : "There are no deals at this time."}
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {!loading && deals.length > 0 && (
          <>
            {/* Hidden on mobile, visible on lg+ */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left py-3.5 px-4 text-muted font-medium">Property</th>
                    <th className="text-left py-3.5 px-4 text-muted font-medium">Buyer</th>
                    <th className="text-left py-3.5 px-4 text-muted font-medium">Agent</th>
                    <th className="text-left py-3.5 px-4 text-muted font-medium">Offer Amount</th>
                    <th className="text-left py-3.5 px-4 text-muted font-medium">Status</th>
                    <th className="text-left py-3.5 px-4 text-muted font-medium">Date</th>
                    <th className="text-right py-3.5 px-4 text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal, idx) => {
                    const isExpanded = expandedId === deal._id;
                    return (
                      <Fragment key={deal._id}>
                        <motion.tr
                          custom={idx}
                          variants={fadeInUp}
                          initial="hidden"
                          animate="visible"
                          className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                            isExpanded ? "bg-primary/[0.02]" : ""
                          }`}
                          onClick={() => toggleExpand(deal._id)}
                        >
                          {/* Property */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {deal.propertyImage ? (
                                <img
                                  src={deal.propertyImage}
                                  alt={deal.propertyTitle}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                  <HiOfficeBuilding className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-dark text-sm truncate max-w-[160px]">
                                  {deal.propertyTitle}
                                </p>
                                <p className="text-xs text-muted">
                                  {formatPrice(deal.propertyPrice, "total")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Buyer */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <HiUser className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm text-dark font-medium truncate max-w-[120px]">
                                {deal.buyerName}
                              </span>
                            </div>
                          </td>

                          {/* Agent */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <HiUser className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm text-dark font-medium truncate max-w-[120px]">
                                {deal.agentName}
                              </span>
                            </div>
                          </td>

                          {/* Offer Amount */}
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-semibold text-dark">
                                {formatPrice(deal.offerAmount, "total")}
                              </p>
                              {deal.finalAmount && deal.finalAmount !== deal.offerAmount && (
                                <p className="text-xs text-muted">
                                  Final: {formatPrice(deal.finalAmount, "total")}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold ${STATUS_BADGE[deal.status]}`}
                            >
                              {STATUS_LABEL[deal.status]}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-muted text-xs whitespace-nowrap">
                            {formatDate(deal.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(deal._id);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              >
                                {isExpanded ? (
                                  <HiX className="w-3.5 h-3.5" />
                                ) : (
                                  <HiReply className="w-3.5 h-3.5" />
                                )}
                                <span>{isExpanded ? "Close" : "View"}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(deal._id, deal.propertyTitle);
                                }}
                                disabled={deletingId === deal._id}
                                title="Delete deal"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {deletingId === deal._id ? (
                                  <Spinner />
                                ) : (
                                  <HiTrash className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded Detail Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              key="expanded"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-slate-50/40"
                            >
                              <td colSpan={7} className="px-6 py-0">
                                <div className="border-t border-slate-100 py-5">
                                  {/* 3-Column Info Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                    {/* Property Info */}
                                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                          <HiOfficeBuilding className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                                          Property Info
                                        </p>
                                      </div>
                                      {deal.propertyImage && (
                                        <img
                                          src={deal.propertyImage}
                                          alt={deal.propertyTitle}
                                          className="w-full h-24 object-cover rounded-lg mb-3"
                                        />
                                      )}
                                      <p className="text-sm font-semibold text-dark mb-1">
                                        {deal.propertyTitle}
                                      </p>
                                      <p className="text-xs text-muted">
                                        Listed Price:{" "}
                                        <span className="font-semibold text-dark">
                                          {formatPrice(deal.propertyPrice, "total")}
                                        </span>
                                      </p>
                                    </div>

                                    {/* Buyer Info */}
                                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                          <HiUser className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                                          Buyer Info
                                        </p>
                                      </div>
                                      <p className="text-sm font-semibold text-dark mb-2">
                                        {deal.buyerName}
                                      </p>
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-muted">
                                          <HiMail className="w-3.5 h-3.5 shrink-0" />
                                          <span className="truncate">{deal.buyerEmail}</span>
                                        </div>
                                        {deal.buyerPhone && (
                                          <div className="flex items-center gap-2 text-xs text-muted">
                                            <HiPhone className="w-3.5 h-3.5 shrink-0" />
                                            <span>{deal.buyerPhone}</span>
                                          </div>
                                        )}
                                        <p className="text-xs text-muted mt-2">
                                          Financing:{" "}
                                          <span className="font-medium text-dark capitalize">
                                            {deal.financingMethod?.replace(/_/g, " ") || "N/A"}
                                          </span>
                                        </p>
                                      </div>
                                    </div>

                                    {/* Agent Info */}
                                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                          <HiUser className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                                          Agent Info
                                        </p>
                                      </div>
                                      <p className="text-sm font-semibold text-dark mb-2">
                                        {deal.agentName}
                                      </p>
                                      <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                          <p className="text-[10px] text-muted mb-0.5">Offer</p>
                                          <p className="text-xs font-bold text-dark">
                                            {formatPrice(deal.offerAmount, "total")}
                                          </p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                          <p className="text-[10px] text-muted mb-0.5">Final</p>
                                          <p className="text-xs font-bold text-dark">
                                            {deal.finalAmount
                                              ? formatPrice(deal.finalAmount, "total")
                                              : "—"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Original Message */}
                                  {deal.message && (
                                    <div className="mb-5">
                                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                                        Original Message
                                      </p>
                                      <div className="bg-primary/5 rounded-xl p-4 text-sm text-dark leading-relaxed">
                                        {deal.message}
                                      </div>
                                    </div>
                                  )}

                                  {/* Payment Details */}
                                  {(deal.paymentMethod || deal.paymentNote || deal.stripePaymentId) && (
                                    <div className="mb-5">
                                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                                        Payment Details
                                      </p>
                                      <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100 space-y-2">
                                        {deal.paymentMethod && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-purple-700">
                                              Method:
                                            </span>
                                            <span className="text-sm text-dark">
                                              {deal.paymentMethod === "stripe" ? "Stripe (Online)" : deal.paymentMethod.replace(/_/g, " ")}
                                              {deal.paymentMethod === "stripe" && (
                                                <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-200 text-emerald-800 text-[9px] font-bold rounded-full uppercase">Verified</span>
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        {deal.earnestMoneyBDT ? (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-purple-700">
                                              Earnest Money:
                                            </span>
                                            <span className="text-sm font-semibold text-dark">
                                              {formatPrice(deal.earnestMoneyBDT, "total")}
                                              {deal.earnestMoneyUSD && (
                                                <span className="text-xs text-muted ml-1.5">
                                                  (${deal.earnestMoneyUSD})
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        ) : null}
                                        {deal.stripePaymentId && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-purple-700">
                                              Transaction:
                                            </span>
                                            <span className="text-xs font-mono text-dark break-all">
                                              {deal.stripePaymentId}
                                            </span>
                                          </div>
                                        )}
                                        {deal.paymentNote && !deal.stripePaymentId && (
                                          <div className="flex items-start gap-2">
                                            <span className="text-xs font-medium text-purple-700 shrink-0">
                                              Note:
                                            </span>
                                            <span className="text-sm text-dark">
                                              {deal.paymentNote}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* History Timeline */}
                                  {deal.history && deal.history.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                                        Deal History
                                      </p>
                                      <div className="relative pl-6">
                                        {/* Vertical line */}
                                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

                                        <div className="space-y-4">
                                          {deal.history.map((entry, hIdx) => (
                                            <div key={hIdx} className="relative">
                                              {/* Dot */}
                                              <div
                                                className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white z-10 ${
                                                  hIdx === deal.history.length - 1
                                                    ? "bg-emerald-500"
                                                    : "bg-slate-300"
                                                }`}
                                              />

                                              <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                  <span
                                                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${actionColor(
                                                      entry.action
                                                    )}`}
                                                  >
                                                    {actionLabel(entry.action)}
                                                  </span>
                                                  {entry.amount !== undefined && (
                                                    <span className="text-xs font-semibold text-dark">
                                                      {formatPrice(entry.amount, "total")}
                                                    </span>
                                                  )}
                                                </div>

                                                {entry.message && (
                                                  <p className="text-xs text-dark leading-relaxed mb-1.5">
                                                    {entry.message}
                                                  </p>
                                                )}

                                                <div className="flex items-center gap-3 text-[10px] text-muted">
                                                  <span className="font-medium">{entry.byUserName}</span>
                                                  <span className="capitalize">
                                                    ({entry.byRole})
                                                  </span>
                                                  <span className="flex items-center gap-0.5">
                                                    <HiClock className="w-3 h-3" />
                                                    {formatDate(entry.createdAt)}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
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

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {deals.map((deal, idx) => {
                const isExpanded = expandedId === deal._id;
                return (
                  <motion.div
                    key={deal._id}
                    custom={idx}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="p-4"
                  >
                    {/* Card Header */}
                    <div
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => toggleExpand(deal._id)}
                    >
                      {deal.propertyImage ? (
                        <img
                          src={deal.propertyImage}
                          alt={deal.propertyTitle}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <HiOfficeBuilding className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">
                          {deal.propertyTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${STATUS_BADGE[deal.status]}`}
                          >
                            {STATUS_LABEL[deal.status]}
                          </span>
                          <span className="text-xs text-muted">
                            {formatPrice(deal.offerAmount, "total")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <HiUser className="w-3 h-3" />
                            {deal.buyerName}
                          </span>
                          <span>{formatDate(deal.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(deal._id, deal.propertyTitle);
                        }}
                        disabled={deletingId === deal._id}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {deletingId === deal._id ? <Spinner /> : <HiTrash className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Property */}
                              <div className="bg-slate-50 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <HiOfficeBuilding className="w-3.5 h-3.5 text-slate-400" />
                                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">
                                    Property
                                  </p>
                                </div>
                                <p className="text-xs font-semibold text-dark mb-0.5">
                                  {deal.propertyTitle}
                                </p>
                                <p className="text-[10px] text-muted">
                                  {formatPrice(deal.propertyPrice, "total")}
                                </p>
                              </div>

                              {/* Buyer */}
                              <div className="bg-slate-50 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <HiUser className="w-3.5 h-3.5 text-primary" />
                                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">
                                    Buyer
                                  </p>
                                </div>
                                <p className="text-xs font-semibold text-dark mb-0.5">
                                  {deal.buyerName}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-muted">
                                  <HiMail className="w-2.5 h-2.5" />
                                  <span className="truncate">{deal.buyerEmail}</span>
                                </div>
                                {deal.buyerPhone && (
                                  <div className="flex items-center gap-1 text-[10px] text-muted">
                                    <HiPhone className="w-2.5 h-2.5" />
                                    <span>{deal.buyerPhone}</span>
                                  </div>
                                )}
                              </div>

                              {/* Agent */}
                              <div className="bg-slate-50 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <HiUser className="w-3.5 h-3.5 text-emerald-500" />
                                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">
                                    Agent
                                  </p>
                                </div>
                                <p className="text-xs font-semibold text-dark mb-1">
                                  {deal.agentName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="bg-white rounded-md px-2 py-1 text-center flex-1">
                                    <p className="text-[8px] text-muted">Offer</p>
                                    <p className="text-[10px] font-bold text-dark">
                                      {formatPrice(deal.offerAmount, "total")}
                                    </p>
                                  </div>
                                  <div className="bg-white rounded-md px-2 py-1 text-center flex-1">
                                    <p className="text-[8px] text-muted">Final</p>
                                    <p className="text-[10px] font-bold text-dark">
                                      {deal.finalAmount
                                        ? formatPrice(deal.finalAmount, "total")
                                        : "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Message */}
                            {deal.message && (
                              <div>
                                <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5">
                                  Message
                                </p>
                                <div className="bg-primary/5 rounded-lg p-3 text-xs text-dark leading-relaxed">
                                  {deal.message}
                                </div>
                              </div>
                            )}

                            {/* Payment */}
                            {(deal.paymentMethod || deal.paymentNote || deal.stripePaymentId) && (
                              <div>
                                <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5">
                                  Payment
                                </p>
                                <div className="bg-purple-50/60 rounded-lg p-3 border border-purple-100 space-y-1">
                                  {deal.paymentMethod && (
                                    <p className="text-xs text-dark">
                                      <span className="font-medium text-purple-700">Method: </span>
                                      {deal.paymentMethod === "stripe" ? "Stripe (Online)" : deal.paymentMethod.replace(/_/g, " ")}
                                    </p>
                                  )}
                                  {deal.earnestMoneyBDT && (
                                    <p className="text-xs text-dark">
                                      <span className="font-medium text-purple-700">Earnest: </span>
                                      {formatPrice(deal.earnestMoneyBDT, "total")}
                                    </p>
                                  )}
                                  {deal.paymentNote && !deal.stripePaymentId && (
                                    <p className="text-xs text-dark">
                                      <span className="font-medium text-purple-700">Note: </span>
                                      {deal.paymentNote}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Timeline */}
                            {deal.history && deal.history.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">
                                  History
                                </p>
                                <div className="relative pl-5">
                                  <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 bg-slate-200" />
                                  <div className="space-y-3">
                                    {deal.history.map((entry, hIdx) => (
                                      <div key={hIdx} className="relative">
                                        <div
                                          className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 border-white z-10 ${
                                            hIdx === deal.history.length - 1
                                              ? "bg-emerald-500"
                                              : "bg-slate-300"
                                          }`}
                                        />
                                        <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                            <span
                                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${actionColor(
                                                entry.action
                                              )}`}
                                            >
                                              {actionLabel(entry.action)}
                                            </span>
                                            {entry.amount !== undefined && (
                                              <span className="text-[10px] font-semibold text-dark">
                                                {formatPrice(entry.amount, "total")}
                                              </span>
                                            )}
                                          </div>
                                          {entry.message && (
                                            <p className="text-[11px] text-dark leading-relaxed">
                                              {entry.message}
                                            </p>
                                          )}
                                          <p className="text-[9px] text-muted mt-1">
                                            {entry.byUserName} ({entry.byRole}) &middot;{" "}
                                            {formatDate(entry.createdAt)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && deals.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-muted">
              Showing {(page - 1) * 10 + 1}&ndash;{Math.min(page * 10, total)} of {total} deals
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

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState((s) => ({ ...s, open: false }))}
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