"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { HiX, HiMail, HiPhone, HiUser, HiLocationMarker } from "react-icons/hi";
import { createInquiry } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

interface ContactOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerAvatar?: string;
}

export default function ContactOwnerModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  ownerName,
  ownerEmail,
  ownerPhone,
  ownerAvatar,
}: ContactOwnerModalProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.warning("Please login to contact the property owner.");
      return;
    }
    if (!message.trim()) {
      toast.warning("Please write a message.");
      return;
    }
    if (message.trim().length < 10) {
      toast.warning("Message must be at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await createInquiry({
        propertyId,
        message: message.trim(),
      });
      toast.success("Your message has been sent to the owner. You can track replies in your dashboard.");
      setMessage("");
      onClose();
    } catch {
      // Error handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HiMail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark">Contact Owner</h2>
                    <p className="text-xs text-muted">Send a message to the property owner</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Property Info */}
                <div className="bg-slate-50 rounded-xl p-3.5">
                  <p className="text-xs text-muted mb-1">Regarding Property</p>
                  <p className="text-sm font-semibold text-dark line-clamp-1">{propertyTitle}</p>
                </div>

                {/* Owner Info Card */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden">
                    {ownerAvatar ? (
                      <img src={ownerAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      ownerName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-dark">{ownerName}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {ownerEmail && (
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <HiMail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ownerEmail}</span>
                        </div>
                      )}
                      {ownerPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <HiPhone className="w-3 h-3 shrink-0" />
                          <span>{ownerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Not logged in warning */}
                {!isAuthenticated && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-amber-800 font-medium">Please login to send a message</p>
                    <p className="text-xs text-amber-600 mt-1">You need an account to contact property owners.</p>
                  </div>
                )}

                {/* Message Form */}
                <div>
                  {isAuthenticated && user && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-muted">
                        Sending as <span className="font-semibold text-dark">{user.name}</span>
                      </span>
                    </div>
                  )}

                  <label className="block text-sm font-semibold text-dark mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Hi, I'm interested in this property. Could you provide more details about..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!isAuthenticated || submitting}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between mt-1.5">
                    <p className="text-xs text-muted">Minimum 10 characters</p>
                    <p className="text-xs text-muted">{message.length}/1000</p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !isAuthenticated}
                  className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <HiMail className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}