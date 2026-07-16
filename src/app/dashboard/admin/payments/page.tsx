"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiCurrencyDollar,
  HiReceiptTax,
  HiChevronLeft,
  HiChevronRight,
  HiCreditCard,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { getAdminPayments } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";
import type { IPayment } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : "৳";
  return `${symbol}${formatNumber(amount)}`;
}

function paymentStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "succeeded" || s === "completed" || s === "success")
    return "bg-emerald-100 text-emerald-700";
  if (s === "pending" || s === "processing")
    return "bg-amber-100 text-amber-700";
  if (s === "failed" || s === "canceled")
    return "bg-red-100 text-red-600";
  return "bg-slate-100 text-slate-600";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalTransactions: 0 });

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminPayments({ page: String(page), limit: "10" });
      const data = res.data.data || res.data;
      setPayments(data.payments || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      if (data.totalRevenue !== undefined || data.totalTransactions !== undefined) {
        setSummary({
          totalRevenue: data.totalRevenue ?? 0,
          totalTransactions: data.totalTransactions ?? 0,
        });
      } else {
        // Compute from current data if not provided
        const allPayments = data.payments || data.data || [];
        const succeeded = allPayments.filter(
          (p: IPayment) => p.status?.toLowerCase() === "succeeded" || p.status?.toLowerCase() === "completed"
        );
        setSummary({
          totalRevenue: succeeded.reduce((sum: number, p: IPayment) => sum + (p.amount || 0), 0),
          totalTransactions: allPayments.length,
        });
      }
    } catch {
      toast.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Payment History</h1>
        <p className="text-sm text-muted mt-1">Track all transactions and revenue across the platform</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" as const }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Total Revenue</p>
              <p className="text-xl md:text-2xl font-bold text-dark">
                {loading ? (
                  <span className="inline-block w-28 h-7 bg-slate-200 rounded-lg animate-pulse" />
                ) : (
                  `৳${formatNumber(summary.totalRevenue)}`
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center">
              <HiReceiptTax className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Total Transactions</p>
              <p className="text-xl md:text-2xl font-bold text-dark">
                {loading ? (
                  <span className="inline-block w-16 h-7 bg-slate-200 rounded-lg animate-pulse" />
                ) : (
                  formatNumber(summary.totalTransactions)
                )}
              </p>
            </div>
          </div>
        </div>
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
        {!loading && payments.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCreditCard className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-1">No payments found</h3>
            <p className="text-sm text-muted">There are no payment transactions recorded yet.</p>
          </div>
        )}

        {/* Table Content */}
        {!loading && payments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Transaction ID</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden md:table-cell">User</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden lg:table-cell">Property</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Amount</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Type</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3.5 px-4 text-muted font-medium hidden xl:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <motion.tr
                    key={p._id}
                    custom={idx}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <HiCreditCard className="w-4 h-4 text-muted shrink-0" />
                        <span className="text-xs font-mono text-muted" title={p.stripePaymentId}>
                          {p.stripePaymentId
                            ? p.stripePaymentId.length > 16
                              ? `${p.stripePaymentId.slice(0, 16)}...`
                              : p.stripePaymentId
                            : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="text-dark font-medium">{p.userName || "—"}</span>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <span className="text-muted truncate max-w-[200px] block">
                        {p.propertyTitle || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-dark">
                        {formatAmount(p.amount, p.currency)}
                      </span>
                      <span className="text-xs text-muted ml-1">{p.currency || "BDT"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${
                        p.paymentType === "earnest_money"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.paymentType === "earnest_money" ? "Earnest Money" : "Feature Fee"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${paymentStatusBadge(p.status)}`}>
                        {p.status || "unknown"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs hidden xl:table-cell">
                      {formatDate(p.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && payments.length > 0 && totalPages > 1 && (
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
    </div>
  );
}