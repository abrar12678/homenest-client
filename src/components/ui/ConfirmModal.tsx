"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiExclamation, HiX } from "react-icons/hi";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

const VARIANT_STYLES = {
  danger: {
    icon: "bg-red-100 text-red-600",
    btn: "bg-red-500 hover:bg-red-600 shadow-red-500/25",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25",
  },
  info: {
    icon: "bg-blue-100 text-blue-600",
    btn: "bg-primary hover:bg-primary-dark shadow-primary/25",
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const style = VARIANT_STYLES[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="relative p-6 pb-0">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <HiX className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${style.icon}`}
                  >
                    <HiExclamation className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{message}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 p-6 pt-5">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-semibold text-muted bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 ${style.btn}`}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
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
                      Processing...
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}