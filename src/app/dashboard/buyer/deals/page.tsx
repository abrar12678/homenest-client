"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiCash,
  HiClipboardCheck,
  HiChevronDown,
  HiChevronUp,
  HiCurrencyBangladeshi,
  HiDocumentText,
  HiExclamationCircle,
  HiPhotograph,
  HiSearch,
  HiShieldCheck,
  HiUser,
  HiX,
  HiChevronRight,
  HiSwitchHorizontal,
  HiCheckCircle,
  HiCreditCard,
  HiLightningBolt,
} from "react-icons/hi";
import {
  getBuyerDeals,
  counterOffer,
  acceptDeal,
  withdrawDeal,
} from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import StripePaymentModal from "@/components/payments/StripePaymentModal";
import type { IDeal, DealStatus, IDealHistoryEntry } from "@/types";

/* ─── Constants ─── */

const ITEMS_PER_PAGE = 6;

type FilterTab = "all" | "pending" | "countered" | "accepted" | "payment" | "completed" | "rejected";

const FILTER_TABS: { key: FilterTab; label: string; statusParam?: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending", statusParam: "pending" },
  { key: "countered", label: "Negotiating", statusParam: "countered" },
  { key: "accepted", label: "Accepted", statusParam: "accepted" },
  { key: "payment", label: "Payment", statusParam: "payment_pending,payment_verified" },
  { key: "completed", label: "Completed", statusParam: "completed" },
  { key: "rejected", label: "Rejected", statusParam: "rejected" },
];

const STATUS_BADGE: Record<DealStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  countered: { bg: "bg-blue-100", text: "text-blue-700", label: "Countered" },
  accepted: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Accepted" },
  payment_pending: { bg: "bg-purple-100", text: "text-purple-700", label: "Payment Pending" },
  payment_verified: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Payment Verified" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
};

const FINANCING_LABELS: Record<string, string> = {
  cash: "Cash Payment",
  bank_transfer: "Bank Transfer",
  loan: "Bank Loan",
  mortgage: "Mortgage",
};

const ACTION_LABELS: Record<string, (name: string, amount?: number) => string> = {
  offer_made: () => "You made an offer",
  countered: (name, amount) =>
    amount ? `${name} countered with ৳${amount.toLocaleString("en-IN")}` : `${name} countered the offer`,
  accepted: (name) => `${name} accepted the offer`,
  rejected: (name) => `${name} rejected the deal`,
  payment_submitted: () => "You submitted payment details",
  payment_verified: (name) => `${name} verified your payment`,
  completed: () => "Deal completed successfully",
  withdrawn: () => "You withdrew the offer",
};

const HISTORY_ICONS: Record<string, { icon: typeof HiCash; color: string }> = {
  offer_made: { icon: HiCurrencyBangladeshi, color: "text-primary" },
  countered: { icon: HiSwitchHorizontal, color: "text-blue-500" },
  accepted: { icon: HiCheckCircle, color: "text-emerald-500" },
  rejected: { icon: HiX, color: "text-red-500" },
  payment_submitted: { icon: HiCreditCard, color: "text-purple-500" },
  payment_verified: { icon: HiShieldCheck, color: "text-cyan-500" },
  completed: { icon: HiCash, color: "text-green-500" },
  withdrawn: { icon: HiExclamationCircle, color: "text-slate-400" },
};

/* ─── Animation ─── */

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

/* ─── Smart Pagination ─── */

function getPaginationRange(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (currentPage > 3) pages.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

/* ─── Component ─── */

export default function MyDealsPage() {
  const [deals, setDeals] = useState<IDeal[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Withdraw confirm
  const [withdrawConfirm, setWithdrawConfirm] = useState<IDeal | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // Counter modal
  const [counterModalDeal, setCounterModalDeal] = useState<IDeal | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [countering, setCountering] = useState(false);

  // Stripe payment modal (only payment method)
  const [stripePayDeal, setStripePayDeal] = useState<IDeal | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  /* ── Fetch ── */

  const fetchDeals = useCallback(
    async (page: number, tab: FilterTab) => {
      try {
        setLoading(true);
        const params: Record<string, string> = {
          page: String(page),
          limit: String(ITEMS_PER_PAGE),
        };
        const tabConfig = FILTER_TABS.find((t) => t.key === tab);
        if (tabConfig?.statusParam) {
          params.status = tabConfig.statusParam;
        }
        const res = await getBuyerDeals(params);
        const data = res.data?.data;
        if (data) {
          setDeals(data.deals ?? []);
          setTotalCount(data.total ?? 0);
          if (data.statusCounts) {
            setStatusCounts(data.statusCounts);
          }
        }
      } catch {
        toast.error("Failed to load deals.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeals(currentPage, activeTab);
  }, [currentPage, activeTab, fetchDeals]);

  /* ── Tab Switch ── */

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setExpandedId(null);
  };

  /* ── Pagination ── */

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Actions ── */

  const handleWithdraw = async () => {
    if (!withdrawConfirm) return;
    try {
      setWithdrawing(true);
      await withdrawDeal(withdrawConfirm._id);
      toast.success("Offer withdrawn successfully.");
      setDeals((prev) => prev.filter((d) => d._id !== withdrawConfirm._id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setStatusCounts((prev) => ({
        ...prev,
        pending: Math.max(0, (prev.pending ?? 0) - 1),
        countered: Math.max(0, (prev.countered ?? 0) - 1),
      }));
      setWithdrawConfirm(null);
    } catch {
      toast.error("Failed to withdraw offer.");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAcceptCounter = async (dealId: string) => {
    try {
      setActionLoading(dealId);
      await acceptDeal(dealId);
      toast.success("Counter offer accepted!");
      setDeals((prev) =>
        prev.map((d) =>
          d._id === dealId
            ? {
                ...d,
                status: "accepted" as DealStatus,
                finalAmount: d.finalAmount,
                history: [
                  ...d.history,
                  {
                    action: "accepted",
                    message: "You accepted the counter offer",
                    byUserId: d.buyerId,
                    byUserName: d.buyerName,
                    byRole: "buyer",
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : d
        )
      );
    } catch {
      toast.error("Failed to accept counter offer.");
    } finally {
      setActionLoading(null);
    }
  };

  const openCounterModal = (deal: IDeal) => {
    setCounterModalDeal(deal);
    setCounterAmount(String(deal.finalAmount || deal.offerAmount));
    setCounterMessage("");
  };

  const handleCounterSubmit = async () => {
    if (!counterModalDeal) return;
    const amount = Number(counterAmount);
    if (!amount || amount <= 0) {
      toast.warning("Please enter a valid amount.");
      return;
    }
    try {
      setCountering(true);
      await counterOffer(counterModalDeal._id, {
        amount,
        message: counterMessage.trim(),
      });
      toast.success("Counter offer submitted!");
      setDeals((prev) =>
        prev.map((d) =>
          d._id === counterModalDeal._id
            ? {
                ...d,
                status: "countered" as DealStatus,
                offerAmount: amount,
                history: [
                  ...d.history,
                  {
                    action: "offer_made",
                    amount,
                    message: counterMessage.trim() || "New counter offer",
                    byUserId: d.buyerId,
                    byUserName: d.buyerName,
                    byRole: "buyer",
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : d
        )
      );
      setCounterModalDeal(null);
      setCounterAmount("");
      setCounterMessage("");
    } catch {
      toast.error("Failed to submit counter offer.");
    } finally {
      setCountering(false);
    }
  };

  /* ── Helpers ── */

  const getTabCount = (tab: FilterTab): number => {
    if (tab === "all") return totalCount;
    if (tab === "payment") {
      return (statusCounts.payment_pending ?? 0) + (statusCounts.payment_verified ?? 0);
    }
    return statusCounts[tab] ?? 0;
  };

  const getDisplayAmount = (deal: IDeal) => {
    return deal.finalAmount || deal.offerAmount || deal.propertyPrice;
  };

  const formatDealAmount = (amount: number) => {
    return `৳${amount.toLocaleString("en-IN")}`;
  };

  const getHistoryLabel = (entry: IDealHistoryEntry): string => {
    const labelFn = ACTION_LABELS[entry.action];
    if (labelFn) return labelFn(entry.byUserName, entry.amount);
    return entry.message || entry.action;
  };

  const getHistoryIcon = (action: string) => {
    const config = HISTORY_ICONS[action];
    if (config) return config;
    return { icon: HiDocumentText, color: "text-slate-400" };
  };

  const toggleExpand = (dealId: string) => {
    setExpandedId((prev) => (prev === dealId ? null : dealId));
  };

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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HiCash className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-dark">
                My Deals
              </h1>
              {!loading && (statusCounts.pending ?? 0) > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">
                  {statusCounts.pending}
                </span>
              )}
            </div>
            <p className="text-sm text-muted">
              Track and manage your property deals
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Status Filter Tabs ── */}
      {!loading && deals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" as const }}
        >
          <div className="bg-slate-100 rounded-2xl p-1 flex flex-wrap gap-1">
            {FILTER_TABS.map((tab) => {
              const count = getTabCount(tab.key);
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-white text-dark shadow-sm"
                        : "text-muted hover:text-dark hover:bg-white/50"
                    }
                  `}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`
                        inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-xs font-bold
                        ${isActive ? "bg-primary/10 text-primary" : "bg-slate-200/80 text-muted"}
                      `}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton
                  width={120}
                  height={100}
                  className="rounded-xl shrink-0 w-full sm:w-[120px] sm:h-[100px]"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton height={18} width="70%" />
                      <Skeleton height={14} width="45%" />
                    </div>
                    <Skeleton height={24} width={80} borderRadius={12} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton height={22} width={100} />
                    <Skeleton height={22} width={90} borderRadius={12} />
                  </div>
                  <Skeleton height={36} width={160} borderRadius={10} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && deals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="bg-white rounded-2xl border border-slate-100 p-10 md:p-16 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiCash className="w-10 h-10 text-primary/30" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">
            {activeTab === "all"
              ? "No deals yet"
              : `No ${FILTER_TABS.find((t) => t.key === activeTab)?.label.toLowerCase() ?? ""} deals`}
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            {activeTab === "all"
              ? "When you make an offer on a property, your deals will appear here. Start exploring to find your dream home."
              : `You don't have any ${FILTER_TABS.find((t) => t.key === activeTab)?.label.toLowerCase() ?? ""} deals at the moment.`}
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm cursor-pointer"
          >
            <HiSearch className="w-4 h-4" />
            Browse Properties
          </Link>
        </motion.div>
      )}

      {/* ── Deals List ── */}
      {!loading && deals.length > 0 && (
        <div className="space-y-4">
          {deals.map((deal, idx) => {
            const isExpanded = expandedId === deal._id;
            const statusConfig = STATUS_BADGE[deal.status];
            const displayAmount = getDisplayAmount(deal);
            const showStrikethrough =
              deal.status === "countered" || deal.status === "accepted"
                ? displayAmount !== deal.propertyPrice
                : deal.offerAmount !== deal.propertyPrice &&
                  deal.offerAmount === displayAmount;
            const history = deal.history || [];

            return (
              <motion.div
                key={deal._id}
                custom={idx}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* ── Card Body ── */}
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Property Image */}
                    <Link
                      href={`/properties/${deal.propertyId}`}
                      className="relative w-full sm:w-[140px] sm:h-[110px] rounded-xl overflow-hidden shrink-0 bg-gray-100 group cursor-pointer"
                    >
                      {deal.propertyImage ? (
                        <Image
                          src={deal.propertyImage}
                          alt={deal.propertyTitle}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 140px"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[110px] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <HiPhotograph className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row: Title + Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <Link
                            href={`/properties/${deal.propertyId}`}
                            className="text-sm font-bold text-dark hover:text-primary transition-colors line-clamp-1 cursor-pointer block"
                          >
                            {deal.propertyTitle}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                            <HiUser className="w-3.5 h-3.5 shrink-0" />
                            <span>{deal.agent?.name || deal.agentName}</span>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 self-start ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <HiCheckCircle className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Amounts */}
                      <div className="flex flex-wrap items-baseline gap-2 mb-2.5">
                        <span className="text-xl font-bold text-emerald-600">
                          {formatDealAmount(displayAmount)}
                        </span>
                        {showStrikethrough && (
                          <span className="text-sm text-muted line-through">
                            {formatDealAmount(deal.propertyPrice)}
                          </span>
                        )}
                        {displayAmount !== deal.propertyPrice && (
                          <span className="text-xs font-medium text-emerald-600/80 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {displayAmount < deal.propertyPrice
                              ? `${Math.round(((deal.propertyPrice - displayAmount) / deal.propertyPrice) * 100)}% below asking`
                              : `${Math.round(((displayAmount - deal.propertyPrice) / deal.propertyPrice) * 100)}% above asking`}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Financing Badge + History Toggle + Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Financing Method Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <HiCash className="w-3.5 h-3.5" />
                          {FINANCING_LABELS[deal.financingMethod] || deal.financingMethod}
                        </span>

                        {/* History Toggle */}
                        {history.length > 0 && (
                          <button
                            onClick={() => toggleExpand(deal._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer"
                          >
                            <HiDocumentText className="w-3.5 h-3.5" />
                            {history.length} {history.length === 1 ? "update" : "updates"}
                            {isExpanded ? (
                              <HiChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <HiChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Status-based Action Buttons */}
                        {deal.status === "pending" && (
                          <button
                            onClick={() => setWithdrawConfirm(deal)}
                            disabled={actionLoading === deal._id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <HiX className="w-4 h-4" />
                            Withdraw Offer
                          </button>
                        )}

                        {deal.status === "countered" && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleAcceptCounter(deal._id)}
                              disabled={actionLoading === deal._id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoading === deal._id ? (
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <HiCheckCircle className="w-4 h-4" />
                              )}
                              Accept Counter
                            </button>
                            <button
                              onClick={() => openCounterModal(deal)}
                              disabled={actionLoading === deal._id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <HiSwitchHorizontal className="w-4 h-4" />
                              Make New Counter
                            </button>
                            <button
                              onClick={() => setWithdrawConfirm(deal)}
                              disabled={actionLoading === deal._id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <HiX className="w-4 h-4" />
                              Withdraw
                            </button>
                          </div>
                        )}

                        {deal.status === "accepted" && (
                          <button
                            onClick={() => setStripePayDeal(deal)}
                            disabled={actionLoading === deal._id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary to-indigo-500 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 cursor-pointer"
                          >
                            <HiLightningBolt className="w-4 h-4" />
                            Pay with Stripe
                          </button>
                        )}

                        {deal.status === "payment_pending" && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-purple-600 bg-purple-50 rounded-xl">
                              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              {deal.paymentMethod === "stripe"
                                ? `Stripe Payment - ৳${formatNumber(deal.earnestMoneyBDT || 0)}`
                                : "Awaiting Verification"}
                            </span>
                            {deal.stripePaymentId && (
                              <span className="text-[10px] font-mono text-muted bg-slate-50 px-2 py-1 rounded-lg">
                                {deal.stripePaymentId.slice(-12)}
                              </span>
                            )}
                          </div>
                        )}

                        {(deal.status === "payment_verified" || deal.status === "completed") && (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-green-700 bg-green-100 rounded-xl">
                            <HiClipboardCheck className="w-4 h-4" />
                            Deal Completed
                          </span>
                        )}

                        {deal.status === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-xl">
                            <HiExclamationCircle className="w-4 h-4" />
                            Deal Ended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Expandable History Timeline ── */}
                <AnimatePresence>
                  {isExpanded && history.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" as const }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 md:px-5 py-4">
                        <h4 className="text-sm font-semibold text-dark mb-4 flex items-center gap-2">
                          <HiDocumentText className="w-4 h-4 text-primary" />
                          Negotiation History
                        </h4>
                        <div className="relative pl-6">
                          {/* Vertical line */}
                          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />

                          <div className="space-y-4">
                            {history.map((entry, hIdx) => {
                              const iconConfig = getHistoryIcon(entry.action);
                              const IconComponent = iconConfig.icon;
                              const isLast = hIdx === history.length - 1;

                              return (
                                <div key={hIdx} className="relative">
                                  {/* Dot */}
                                  <div
                                    className={`absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center ${
                                      isLast
                                        ? "bg-white ring-2 ring-primary/30"
                                        : "bg-white ring-2 ring-slate-200"
                                    }`}
                                  >
                                    <IconComponent
                                      className={`w-3 h-3 ${iconConfig.color} ${
                                        isLast ? "" : "opacity-60"
                                      }`}
                                    />
                                  </div>

                                  {/* Content */}
                                  <div className="pb-1">
                                    <p className="text-sm text-dark leading-snug">
                                      {getHistoryLabel(entry)}
                                    </p>
                                    {entry.message && entry.action !== "offer_made" && entry.action !== "countered" && (
                                      <p className="text-xs text-muted mt-0.5 line-clamp-2">
                                        {entry.message}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted">
                                        {entry.byRole === "buyer"
                                          ? "You"
                                          : entry.byUserName || "Agent"}
                                      </span>
                                      <span className="text-xs text-slate-300">&middot;</span>
                                      <span className="text-xs text-muted">
                                        {formatDate(entry.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          transition={{
            duration: 0.4,
            delay: 0.3,
            ease: "easeOut" as const,
          }}
          className="flex items-center justify-center gap-1.5"
        >
          {/* Previous */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-muted bg-white border border-slate-200 hover:bg-slate-50 hover:text-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ‹
          </button>

          {getPaginationRange(currentPage, totalPages).map((page, idx) =>
            page === "..." ? (
              <span
                key={`dots-${idx}`}
                className="inline-flex items-center justify-center w-9 h-9 text-sm text-muted"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page)}
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

          {/* Next */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-muted bg-white border border-slate-200 hover:bg-slate-50 hover:text-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ›
          </button>
        </motion.div>
      )}

      {/* ── Withdraw Confirm Modal ── */}
      <ConfirmModal
        isOpen={!!withdrawConfirm}
        onClose={() => setWithdrawConfirm(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Offer"
        message={`Are you sure you want to withdraw your offer for "${withdrawConfirm?.propertyTitle ?? "this property"}"? This action cannot be undone.`}
        confirmText="Withdraw Offer"
        cancelText="Keep Offer"
        variant="danger"
        loading={withdrawing}
      />

      {/* ── Counter Offer Modal ── */}
      <Modal
        isOpen={!!counterModalDeal}
        onClose={() => {
          setCounterModalDeal(null);
          setCounterAmount("");
          setCounterMessage("");
        }}
        title="Make a Counter Offer"
      >
        {counterModalDeal && (
          <div className="space-y-4">
            {/* Current counter info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
              <p className="text-xs font-medium text-blue-600 mb-1">
                Current Counter Amount
              </p>
              <p className="text-lg font-bold text-dark">
                {formatDealAmount(counterModalDeal.finalAmount || counterModalDeal.offerAmount)}
              </p>
              <p className="text-xs text-muted mt-0.5">
                Listing price: {formatDealAmount(counterModalDeal.propertyPrice)}
              </p>
            </div>

            {/* New amount */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Your New Offer Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                  ৳
                </span>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  min={0}
                  step={10000}
                  placeholder="Enter your offer amount"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Message (optional)
              </label>
              <textarea
                rows={3}
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Add a note to your counter offer..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-colors"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setCounterModalDeal(null);
                  setCounterAmount("");
                  setCounterMessage("");
                }}
                disabled={countering}
                className="px-4 py-2.5 text-sm font-medium text-muted bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCounterSubmit}
                disabled={countering || !counterAmount || Number(counterAmount) <= 0}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {countering ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <HiChevronRight className="w-4 h-4" />
                )}
                Submit Counter Offer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Stripe Payment Modal */}
      {stripePayDeal && (
        <StripePaymentModal
          isOpen={!!stripePayDeal}
          onClose={() => setStripePayDeal(null)}
          dealId={stripePayDeal._id}
          dealTitle={stripePayDeal.propertyTitle}
          finalAmount={stripePayDeal.finalAmount || stripePayDeal.offerAmount}
          onSuccess={(updatedDeal) => {
            setDeals((prev) =>
              prev.map((d) =>
                d._id === updatedDeal._id ? { ...d, ...updatedDeal } : d
              )
            );
            setStripePayDeal(null);
            fetchDeals(currentPage, activeTab);
          }}
        />
      )}
    </div>
  );
}