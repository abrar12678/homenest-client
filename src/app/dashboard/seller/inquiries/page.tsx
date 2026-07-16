"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  HiMail,
  HiMailOpen,
  HiReply,
  HiChevronLeft,
  HiChevronRight,
  HiLocationMarker,
  HiUser,
} from "react-icons/hi";
import { getReceivedInquiries, replyToInquiry } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { IInquiry } from "@/types";

type TabFilter = "all" | "pending" | "replied";
const ITEMS_PER_PAGE = 6;

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

/** Generate smart pagination numbers with ellipsis */
function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export default function InquiriesPage() {
  const { user } = useAuthStore();
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      };
      if (activeTab !== "all") params.status = activeTab;
      const res = await getReceivedInquiries(params);
      const data = res.data.data;
      const items = data?.inquiries || data || [];
      setInquiries(Array.isArray(items) ? items : []);
      setTotalPages(
        data?.totalPages ||
          Math.ceil(
            (Array.isArray(items) ? items.length : 0) / ITEMS_PER_PAGE
          ) ||
          1
      );
    } catch {
      toast.error("Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab, page]);

  const handleReply = useCallback(
    async (inquiryId: string) => {
      if (!replyText.trim()) {
        toast.warning("Please type a reply before sending.");
        return;
      }
      try {
        setReplyingId(inquiryId);
        await replyToInquiry(inquiryId, replyText.trim());
        toast.success("Reply sent successfully!");
        setReplyText("");
        setOpenReplyId(null);
        // Update local state
        setInquiries((prev) =>
          prev.map((inq) =>
            inq._id === inquiryId
              ? {
                  ...inq,
                  status: "replied" as const,
                  replies: [
                    ...inq.replies,
                    {
                      message: replyText.trim(),
                      repliedBy: user?._id || "",
                      repliedByName: user?.name || "You",
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : inq
          )
        );
      } catch {
        toast.error("Failed to send reply.");
      } finally {
        setReplyingId(null);
      }
    },
    [replyText, user]
  );

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  const tabs: { label: string; value: TabFilter; count?: number }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Replied", value: "replied" },
  ];

  const paginationRange = useMemo(
    () => getPaginationRange(page, totalPages),
    [page, totalPages]
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-36 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-6 w-16 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-20 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-slate-200 rounded-lg" />
                <div className="h-6 w-16 bg-slate-200 rounded-lg" />
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-lg" />
              <div className="h-3 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-10 w-full bg-slate-200 rounded-xl mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            Inquiries
          </h1>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {pendingCount} pending
            </span>
          )}
        </div>
        <p className="text-sm text-muted">
          {inquiries.length} total
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" as const }}
        className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1 w-fit"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
            className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.value
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-dark"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-200 text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Empty State */}
      {!loading && inquiries.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 md:p-16 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiMail className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">
            {activeTab === "pending"
              ? "No pending inquiries"
              : activeTab === "replied"
                ? "No replied inquiries"
                : "No inquiries yet"}
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            {activeTab === "all"
              ? "When buyers send you inquiries about your properties, they'll appear here."
              : `You don't have any ${activeTab} inquiries at the moment.`}
          </p>
        </motion.div>
      )}

      {/* Inquiry List */}
      {inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inquiry, idx) => {
            const hasReplies = inquiry.replies?.length > 0;
            const isReplyOpen = openReplyId === inquiry._id;

            return (
              <motion.div
                key={inquiry._id}
                custom={idx}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* Main inquiry content */}
                <div className="p-4 md:p-5">
                  {/* Top row: buyer info + status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <HiUser className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-dark">
                          {inquiry.fromUserName}
                        </h3>
                        <p className="text-xs text-muted">
                          {inquiry.fromUserEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-muted">
                        {formatDate(inquiry.createdAt)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          inquiry.status === "replied"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {inquiry.status === "replied" ? (
                          <HiMailOpen className="w-3.5 h-3.5" />
                        ) : (
                          <HiMail className="w-3.5 h-3.5" />
                        )}
                        {inquiry.status === "replied" ? "Replied" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Property link */}
                  <Link
                    href={`/properties/${inquiry.propertyId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors mb-2 cursor-pointer"
                  >
                    <HiLocationMarker className="w-3.5 h-3.5" />
                    {inquiry.propertyTitle}
                  </Link>

                  {/* Original Message */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 text-sm text-dark leading-relaxed">
                    {inquiry.message}
                  </div>

                  {/* Replies Thread */}
                  {hasReplies && (
                    <div className="mt-3 space-y-2.5">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                        Replies ({inquiry.replies.length})
                      </p>
                      {inquiry.replies.map((reply, rIdx) => (
                        <div
                          key={rIdx}
                          className={`rounded-2xl p-3.5 text-sm leading-relaxed ${
                            reply.repliedBy === user?._id
                              ? "bg-primary/5 border border-primary/10"
                              : "bg-green-50/50 border border-green-100"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-xs font-semibold ${
                                reply.repliedBy === user?._id
                                  ? "text-primary"
                                  : "text-secondary"
                              }`}
                            >
                              {reply.repliedByName}
                              {reply.repliedBy === user?._id && (
                                <span className="text-muted font-normal ml-1">
                                  (You)
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-muted">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-dark">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Toggle / Form */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    {!isReplyOpen ? (
                      <button
                        onClick={() => {
                          setOpenReplyId(inquiry._id);
                          setReplyText("");
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <HiReply className="w-4 h-4" />
                        {hasReplies ? "Send Another Reply" : "Reply"}
                      </button>
                    ) : (
                      <div className="space-y-2.5">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all resize-none"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setOpenReplyId(null);
                              setReplyText("");
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-medium text-muted bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(inquiry._id)}
                            disabled={
                              replyingId === inquiry._id || !replyText.trim()
                            }
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-primary/20"
                          >
                            {replyingId === inquiry._id ? (
                              <>
                                <svg
                                  className="animate-spin h-3.5 w-3.5"
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
                                Sending…
                              </>
                            ) : (
                              <>
                                <HiReply className="w-3.5 h-3.5" />
                                Send Reply
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination — Smart */}
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
    </div>
  );
}