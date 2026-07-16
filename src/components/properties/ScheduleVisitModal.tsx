"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  HiX,
  HiCalendar,
  HiClock,
  HiUser,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiCheckCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { scheduleVisit } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
}

export default function ScheduleVisitModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyLocation,
}: ScheduleVisitModalProps) {
  const { user, isAuthenticated } = useAuthStore();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Max date: 3 months from now
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset form with user data when modal opens
  const handleOpen = () => {
    if (user) {
      setName(user.name || "");
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setPreferredDate("");
      setPreferredTime("");
      setName(user?.name || "");
      setPhone("");
      setMessage("");
      onClose();
    }
  };

  const validateForm = (): boolean => {
    if (!preferredDate) {
      toast.warning("Please select a preferred date.");
      return false;
    }
    if (!preferredTime) {
      toast.warning("Please select a preferred time slot.");
      return false;
    }
    if (!name.trim()) {
      toast.warning("Please enter your name.");
      return false;
    }
    if (!phone.trim()) {
      toast.warning("Please enter your phone number.");
      return false;
    }
    const phoneRegex = /^[+\-\s()0-9]{7,20}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.warning("Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.warning("Please login to schedule a visit.");
      return;
    }
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await scheduleVisit({
        propertyId,
        preferredDate,
        preferredTime,
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim() || undefined,
      });
      toast.success("Visit scheduled successfully! You can track it in your dashboard.");
      handleClose();
    } catch {
      // Error handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  // Generate available time slots (exclude past times for today)
  const availableSlots = useMemo(() => {
    if (!preferredDate) return TIME_SLOTS;
    const selectedDate = new Date(preferredDate + "T00:00:00");
    const isToday =
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate();

    if (!isToday) return TIME_SLOTS;

    const currentHour = today.getHours();
    return TIME_SLOTS.filter((slot) => {
      const hour = parseInt(slot.split(":")[0], 10);
      const isPM = slot.includes("PM");
      const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
      return hour24 > currentHour;
    });
  }, [preferredDate]);

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
            onPointerEnter={handleOpen}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <HiCalendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark">Schedule a Visit</h2>
                    <p className="text-xs text-muted">Pick a date & time to visit the property</p>
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
                  <p className="text-xs text-muted mb-1">Property</p>
                  <p className="text-sm font-semibold text-dark line-clamp-1">{propertyTitle}</p>
                  {propertyLocation && (
                    <div className="flex items-center gap-1 text-xs text-muted mt-1">
                      <HiLocationMarker className="w-3 h-3" />
                      <span>{propertyLocation}</span>
                    </div>
                  )}
                </div>

                {/* Not logged in warning */}
                {!isAuthenticated && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-amber-800 font-medium">Please login to schedule a visit</p>
                    <p className="text-xs text-amber-600 mt-1">You need an account to book property visits.</p>
                  </div>
                )}

                {/* Date Picker */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                    <HiCalendar className="w-4 h-4 text-primary" />
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => {
                      setPreferredDate(e.target.value);
                      setPreferredTime(""); // Reset time when date changes
                    }}
                    min={todayStr}
                    max={maxDateStr}
                    disabled={!isAuthenticated || submitting}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-muted mt-1.5">You can schedule up to 3 months in advance</p>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                    <HiClock className="w-4 h-4 text-primary" />
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  {preferredDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setPreferredTime(slot)}
                            disabled={!isAuthenticated || submitting}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                              preferredTime === slot
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                                : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                          <HiInformationCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <p className="text-xs text-amber-700">No more available slots for today. Please pick a future date.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-muted">Please select a date first to see available time slots.</p>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                    <HiUser className="w-4 h-4 text-primary" />
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={!isAuthenticated || submitting}
                    maxLength={50}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                    <HiPhone className="w-4 h-4 text-primary" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +880 1234-567890"
                    disabled={!isAuthenticated || submitting}
                    maxLength={20}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-muted mt-1.5">The agent will use this to contact you about the visit</p>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                    <HiMail className="w-4 h-4 text-primary" />
                    Additional Note <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any specific questions or requests for the visit..."
                    disabled={!isAuthenticated || submitting}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-muted mt-1 text-right">{message.length}/500</p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !isAuthenticated}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-4 h-4" />
                      Confirm Visit
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