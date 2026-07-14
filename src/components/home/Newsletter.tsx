"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiMail } from "react-icons/hi";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1E40AF]">
      {/* Decorative floating orbs */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-blue-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-[80px]" />

      {/* Dot grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <HiMail className="h-7 w-7 text-blue-300" />
          </div>

          {/* Heading */}
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            Stay Updated with New Listings
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-lg text-blue-200/70">
            Subscribe to our newsletter and never miss a new property listing
            that matches your preferences
          </p>

          {/* Email form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <div className="relative flex-1">
              <HiMail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="h-full w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-sm text-[#1E293B] shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-emerald-400/50 sm:rounded-r-none sm:rounded-bl-xl sm:rounded-tl-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-7 py-3.5 font-semibold text-sm text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-60 sm:w-auto rounded-xl sm:rounded-l-none sm:rounded-br-xl sm:rounded-tr-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
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
                  Subscribing...
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}