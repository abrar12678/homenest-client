"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiHome, HiUsers, HiStar, HiLocationMarker } from "react-icons/hi";
import { getStats } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import type { IStats } from "@/types";

/* ─── Fallback data when API is unavailable ─── */
const defaultStats: IStats = {
  totalProperties: 10000,
  totalUsers: 5000,
  totalReviews: 800,
  totalCities: 50,
};

/* ─── Stat item definitions ─── */
const statItems: {
  key: keyof IStats;
  label: string;
  icon: typeof HiHome;
}[] = [
  { key: "totalProperties", label: "Properties Listed", icon: HiHome },
  { key: "totalUsers", label: "Happy Clients", icon: HiUsers },
  { key: "totalReviews", label: "Positive Reviews", icon: HiStar },
  { key: "totalCities", label: "Cities Covered", icon: HiLocationMarker },
];

/* ─── Animated counter component ─── */
function AnimatedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{formatNumber(count)}+</span>;
}

/* ─── Stats section ─── */
export default function Stats({ title }: { title?: string } = {}) {
  const [stats, setStats] = useState<IStats>(defaultStats);

  useEffect(() => {
    getStats()
      .then((res) => {
        if (res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  return (
    <section className="relative z-30 py-6 md:py-8">
      {/* Gradient background band */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        {title && (
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
          </motion.div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-14 w-full">
          {statItems.map((item, idx) => (
            <motion.div
              key={item.key}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center text-white cursor-default hover:scale-[1.06] hover:bg-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-7 h-7" />
              </div>

              {/* Counter */}
              <div className="text-2xl md:text-3xl font-extrabold mb-1">
                <AnimatedNumber target={typeof stats[item.key] === 'number' ? stats[item.key] as number : 0} />
              </div>

              {/* Label */}
              <p className="text-sm font-medium text-white/70">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
