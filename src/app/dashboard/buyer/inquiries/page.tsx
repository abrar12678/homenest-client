"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiMail,
  HiMailOpen,
  HiChevronDown,
  HiChevronUp,
  HiChatAlt2,
  HiUser,
  HiCalendar,
  HiCheckCircle,
  HiClock,
  HiReply,
  HiSearch,
  HiPaperAirplane,
} from "react-icons/hi";
import { getSentInquiries, replyToInquiry } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, truncateText } from "@/lib/utils";
import type { IInquiry } from "@/types";

/* ─── Constants ─── */

const ITEMS_PER_PAGE = 5;

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

export default function InquiriesPage() {
  const { user } = useAuthStore();
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  /* ── Fetch ── */

  const fetchInquiries = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await getSentInquiries({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      });
      const data = res.data?.data;
      if (data) {
        setInquiries(
          Array.isArray(data) ? data : data.inquiries || data.properties || []
        );
        setTotalCount(
          data.total ?? (Array.isArray(data) ? data.length : 0)
        );
      }
    } catch {
      toast.error("Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries(currentPage);
  }, [currentPage, fetchInquiries]);

  /* ── Helpers ── */

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setOpenReplyId(null);
    setReplyText("");
  };

  const handleReply = async (inquiryId: string) => {
    if (!replyText.trim()) { toast.warning("Please type a reply."); return; }
    try {
      setReplyingId(inquiryId);
      await replyToInquiry(inquiryId, replyText.trim());
      toast.success("Reply sent!");
      setReplyText("");
      setOpenReplyId(null);
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
                    repliedByRole: "user",
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
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedId(null);
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
            <HiMail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-dark">
                My Inquiries
              </h1>
              {!loading && totalCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary">
                  {totalCount}
                </span>
              )}
            </div>
            <p className="text-sm text-muted">
              Track your sent inquiries and agent replies
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 md:p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton height={18} width="60%" />
                  <Skeleton height={14} width="90%" />
                  <div className="flex items-center gap-4 pt-1">
                    <Skeleton height={14} width={80} />
                    <Skeleton height={14} width={100} />
                    <Skeleton height={22} width={70} borderRadius={12} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && inquiries.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="bg-white rounded-2xl border border-slate-100 p-10 md:p-16 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiChatAlt2 className="w-10 h-10 text-primary/30" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">
            No inquiries sent yet
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Found a property you&apos;re interested in? Send an inquiry to the
            agent and track all conversations here.
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

      {/* ── Inquiries List ── */}
      {!loading && inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inquiry, idx) => {
            const isExpanded = expandedId === inquiry._id;
            const isReplied = inquiry.status === "replied";
            const replies = inquiry.replies ?? [];
            const agentName = inquiry.toAgent?.name || "Agent";

            return (
              <motion.div
                key={inquiry._id}
                custom={idx}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* Main Row */}
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isReplied
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {isReplied ? (
                        <HiMailOpen className="w-5 h-5" />
                      ) : (
                        <HiMail className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Property Title */}
                      <Link
                        href={`/properties/${inquiry.propertyId ?? ""}`}
                        className="text-sm font-bold text-dark hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                      >
                        {inquiry.propertyTitle ?? "Untitled Property"}
                      </Link>

                      {/* Message */}
                      <p className="text-sm text-muted mt-1 line-clamp-2">
                        {truncateText(inquiry.message ?? "", 150)}
                      </p>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                        {/* Agent Name */}
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <HiUser className="w-3.5 h-3.5" />
                          <span>{agentName}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <HiCalendar className="w-3.5 h-3.5" />
                          <span>{formatDate(inquiry.createdAt)}</span>
                        </div>

                        {/* Status Badge */}
                        {isReplied ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <HiCheckCircle className="w-3 h-3" />
                            Replied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            <HiClock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand Button — always show when there are replies OR to allow reply */}
                    {(replies.length > 0 || isReplied) && (
                      <button
                        onClick={() => toggleExpand(inquiry._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                      >
                        <HiReply className="w-3.5 h-3.5" />
                        {replies.length > 0 ? (
                          <>
                            {replies.length}{" "}
                            {replies.length === 1 ? "reply" : "replies"}
                          </>
                        ) : (
                          "View"
                        )}
                        {isExpanded ? (
                          <HiChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <HiChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Conversation Thread */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut" as const,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 md:px-5 py-4 space-y-4">
                        {/* Original message */}
                        <div className="bg-primary/5 rounded-xl p-3.5 border border-primary/10">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                              <HiUser className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-dark">You</span>
                            <span className="text-xs text-muted">{formatDate(inquiry.createdAt)}</span>
                          </div>
                          <p className="text-sm text-dark leading-relaxed pl-9">{inquiry.message}</p>
                        </div>

                        {/* Replies thread */}
                        {replies.length > 0 && (
                          <div className="space-y-3">
                            {replies.map((reply, rIdx) => {
                              const isMe = reply.repliedBy === user?._id;
                              return (
                                <div
                                  key={rIdx}
                                  className={`rounded-xl border p-3.5 ${
                                    isMe
                                      ? "bg-primary/5 border-primary/10"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                          isMe ? "bg-primary/10" : "bg-secondary/10"
                                        }`}
                                      >
                                        <HiReply
                                          className={`w-3.5 h-3.5 ${
                                            isMe ? "text-primary" : "text-secondary"
                                          }`}
                                        />
                                      </div>
                                      <span className="text-xs font-semibold text-dark">
                                        {isMe ? "You" : reply.repliedByName ?? "Agent"}
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-dark leading-relaxed pl-9">
                                    {reply.message ?? ""}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply form */}
                        {openReplyId === inquiry._id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              placeholder="Type your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                  handleReply(inquiry._id);
                                }
                              }}
                              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setOpenReplyId(null);
                                  setReplyText("");
                                }}
                                disabled={replyingId === inquiry._id}
                                className="px-3.5 py-1.5 text-xs font-medium text-muted bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReply(inquiry._id)}
                                disabled={
                                  replyingId === inquiry._id || !replyText.trim()
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {replyingId === inquiry._id ? (
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
                                ) : (
                                  <HiPaperAirplane className="w-3.5 h-3.5" />
                                )}
                                Send
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setOpenReplyId(inquiry._id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 rounded-lg transition-colors cursor-pointer"
                          >
                            <HiPaperAirplane className="w-3.5 h-3.5" />
                            {replies.length > 0
                              ? "Reply Again"
                              : "Send a Reply"}
                          </button>
                        )}
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

          {getPageNumbers().map((page, idx) =>
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
    </div>
  );
}