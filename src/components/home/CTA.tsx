"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A] py-20 md:py-28">
      {/* Large centered gradient orb */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

      {/* Smaller accent orbs */}
      <div className="pointer-events-none absolute top-12 right-[15%] h-40 w-40 rounded-full bg-emerald-500/8 blur-[60px]" />
      <div className="pointer-events-none absolute bottom-16 left-[10%] h-32 w-32 rounded-full bg-blue-400/8 blur-[50px]" />

      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Heading */}
          <h2 className="mb-5 text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
            Ready to Find Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Perfect Home?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-lg text-lg text-slate-400">
            Join thousands of happy homeowners who found their dream property
            through HomeNest
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/properties" className="group w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E40AF] to-[#2563EB] px-8 py-4 font-semibold text-sm text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40">
                Explore Properties
                <HiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>

            <Link href="/login" className="group w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-sm text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                List Your Property
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}