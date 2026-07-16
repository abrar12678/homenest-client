"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiSearch,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
  HiMail,
  HiUser,
  HiX,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { getAdminMessages, deleteAdminMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { IContactMessage } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<IContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"}>({open: false, title: "", message: "", onConfirm: () => {}});

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (search.trim()) params.search = search.trim();
      const res = await getAdminMessages(params);
      const data = res.data.data || res.data;
      setMessages(data.messages || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = (messageId: string, name: string) => {
    setConfirmState({
      open: true,
      title: "Delete Message",
      message: `Delete message from "${name}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          setDeletingId(messageId);
          await deleteAdminMessage(messageId);
          toast.success("Message deleted successfully.");
          fetchMessages();
        } catch {
          toast.error("Failed to delete message.");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Contact Messages</h1>
        <p className="text-sm text-muted mt-1">View and manage messages submitted through the contact form</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" as const }}
        className="relative max-w-md"
      >
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
        />
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-32" />
                  <div className="h-3 bg-slate-200 rounded w-48" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-3/4 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" as const }}
          className="bg-white rounded-2xl border border-slate-100 shadow-lg p-12 text-center"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiMail className="w-9 h-9 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark mb-1">No messages found</h3>
          <p className="text-sm text-muted">
            {search ? "Try adjusting your search query." : "There are no contact messages at this time."}
          </p>
        </motion.div>
      )}

      {/* Message Cards */}
      {!loading && messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            const isExpanded = expandedId === msg._id;
            return (
              <motion.div
                key={msg._id || idx}
                custom={idx}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <HiUser className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-dark text-sm md:text-base">{msg.name}</h3>
                        <p className="text-xs text-muted truncate">{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted hidden sm:inline">{formatDate(msg.createdAt || new Date().toISOString())}</span>
                      <button
                        onClick={() => msg._id && handleDelete(msg._id, msg.name)}
                        disabled={deletingId === msg._id}
                        title="Delete message"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === msg._id ? (
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <HiTrash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="mt-3 mb-2">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                      {msg.subject}
                    </span>
                  </div>

                  {/* Message Body */}
                  <div className="text-sm text-muted leading-relaxed">
                    {isExpanded ? (
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    ) : (
                      <p className="line-clamp-2">{msg.message}</p>
                    )}
                  </div>

                  {/* Expand/Collapse */}
                  {msg.message.length > 120 && (
                    <button
                      onClick={() => msg._id && toggleExpand(msg._id)}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Show less <HiX className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Read more</>
                      )}
                    </button>
                  )}

                  {/* Date on mobile */}
                  <p className="text-xs text-muted mt-3 sm:hidden">{formatDate(msg.createdAt || new Date().toISOString())}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && messages.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" as const }}
          className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-lg px-5 py-4"
        >
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
        </motion.div>
      )}

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