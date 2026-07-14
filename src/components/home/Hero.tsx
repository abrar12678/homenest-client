"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiSearch, HiArrowRight } from "react-icons/hi";

const cityOptions = [
  { value: "", label: "All Cities" },
  { value: "dhaka", label: "Dhaka" },
  { value: "chittagong", label: "Chittagong" },
  { value: "sylhet", label: "Sylhet" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "khulna", label: "Khulna" },
  { value: "comilla", label: "Comilla" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" as const },
  }),
};

export default function Hero() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* ── Rich gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-primary-dark to-primary" />

      {/* ── Subtle mesh / grid pattern overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Floating orbs (3, different colours & speeds) ── */}
      <motion.div
        className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full bg-primary-light/20 blur-3xl"
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[6%] w-96 h-96 rounded-full bg-secondary-light/15 blur-3xl"
        animate={{ x: [0, -25, 35, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[55%] left-[45%] w-64 h-64 rounded-full bg-accent/10 blur-3xl"
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 40, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-32 pb-20">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-10"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary-light opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary-light" />
          </span>
          <span className="text-sm font-medium text-blue-100">
            Trusted by 5,000+ happy clients
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          Find Your{" "}
          <span className="text-[1.15em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 inline-block">
            Perfect Home
          </span>
        </motion.h1>

        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-200/70 mb-8"
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          in Bangladesh
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg text-blue-200/60 mb-12 max-w-2xl mx-auto leading-relaxed"
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="visible"
        >
          Discover thousands of verified properties across Dhaka, Chittagong,
          Sylhet, Rajshahi and more — your next home is just a search away.
        </motion.p>

        {/* ── Search Bar ── */}
        <motion.div
          className="bg-white rounded-2xl p-2 sm:p-3 shadow-2xl shadow-black/25 max-w-2xl mx-auto mb-12"
          variants={fadeUp}
          custom={4}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            {/* City select */}
            <div className="relative flex-1">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 pr-10 rounded-xl bg-slate-50 text-sm text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition"
              >
                {cityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Type select */}
            <div className="relative flex-1">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 pr-10 rounded-xl bg-slate-50 text-sm text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3.5 bg-gradient-to-r from-primary-dark to-primary hover:from-primary hover:to-primary-light text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 sm:w-auto w-full"
            >
              <HiSearch className="w-5 h-5" />
              Search
            </button>
          </div>
        </motion.div>

        {/* ── CTA Buttons ── */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="visible"
        >
          <button
            onClick={() => router.push("/properties")}
            className="group px-8 py-3.5 bg-white text-primary rounded-xl font-semibold text-sm shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            Explore Properties
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3.5 bg-transparent border border-white/30 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition-all duration-300"
          >
            List Your Property
          </button>
        </motion.div>
      </div>
    </section>
  );
}
