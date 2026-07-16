"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiHeart,
  HiMail,
  HiStar,
  HiSearch,
  HiCollection,
  HiChevronRight,
  HiLocationMarker,
  HiPhotograph,
} from "react-icons/hi";
import { getFavorites, getSentInquiries, getProperties } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import type { IProperty } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function BuyerDashboardPage() {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<IProperty[]>([]);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [recentProperties, setRecentProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [favRes, inqRes, propsRes] = await Promise.allSettled([
        getFavorites(),
        getSentInquiries(),
        getProperties({ sortBy: "newest", limit: "3" }),
      ]);

      if (favRes.status === "fulfilled") {
        const favData = favRes.value.data?.data;
        setFavorites(
          Array.isArray(favData) ? favData : favData?.properties || [],
        );
      }

      if (inqRes.status === "fulfilled") {
        const inqData = inqRes.value.data?.data;
        if (inqData) {
          setInquiriesCount(
            Array.isArray(inqData) ? inqData.length : inqData.total || 0,
          );
        }
      }

      if (propsRes.status === "fulfilled") {
        const propsData = propsRes.value.data?.data;
        const propsList = Array.isArray(propsData)
          ? propsData
          : propsData?.properties || [];
        setRecentProperties(propsList.slice(0, 3));
      }
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Favorites",
      value: loading ? "—" : favorites.length,
      icon: HiHeart,
      color: "bg-rose-100 text-rose-600",
      hoverBorder: "hover:border-rose-200",
    },
    {
      label: "Inquiries Sent",
      value: loading ? "—" : inquiriesCount,
      icon: HiMail,
      color: "bg-amber-100 text-amber-600",
      hoverBorder: "hover:border-amber-200",
    },
    {
      label: "Reviews Given",
      value: "—",
      icon: HiStar,
      color: "bg-emerald-100 text-emerald-600",
      hoverBorder: "hover:border-emerald-200",
    },
  ];

  const quickActions = [
    {
      label: "Browse Properties",
      description: "Explore thousands of listings",
      href: "/properties",
      icon: HiSearch,
      gradient: "from-primary to-primary-light",
      shadow: "shadow-primary/20",
    },
    {
      label: "My Favorites",
      description: "View your saved properties",
      href: "/dashboard/buyer/favorites",
      icon: HiHeart,
      gradient: "from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/20",
    },
    {
      label: "My Inquiries",
      description: "Track sent inquiries & replies",
      href: "/dashboard/buyer/inquiries",
      icon: HiMail,
      gradient: "from-secondary to-secondary-light",
      shadow: "shadow-secondary/20",
    },
  ];

  return (
    <div className="space-y-0">
      {/* Welcome Banner — extends full width using negative margin */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light py-10 md:py-14 overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 mb-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name || "User"} 👋
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xl">
              Here&apos;s an overview of your property search activity. Find
              your dream home today!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="space-y-10">
        {/* Stat Cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-100 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton circle width={56} height={56} />
                      <div className="flex-1">
                        <Skeleton height={14} width={100} />
                        <Skeleton height={28} width={60} className="mt-2" />
                      </div>
                    </div>
                  </div>
                ))
              : stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    custom={idx}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className={`group bg-white border border-slate-100 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 ${stat.hoverBorder}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <stat.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm text-muted font-medium">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-dark">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg md:text-xl font-bold text-dark mb-5">
            Quick Actions
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
          >
            {quickActions.map((action) => (
              <motion.div key={action.label} variants={fadeInUp} custom={0}>
                <Link href={action.href} className="block group">
                  <div className="relative bg-white border border-slate-100 rounded-2xl p-5 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div
                      className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.gradient} opacity-5 rounded-bl-full`}
                    />
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} ${action.shadow} shadow-lg flex items-center justify-center mb-4`}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-xs text-muted">{action.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Go now</span>
                      <HiChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Recently Viewed */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-bold text-dark">
              Recently Viewed
            </h2>
            <Link
              href="/properties"
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              View all
              <HiChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                >
                  <Skeleton height={180} className="w-full" />
                  <div className="p-4 space-y-2.5">
                    <Skeleton height={18} width="50%" />
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={14} width="40%" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && recentProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" as const }}
              className="bg-white rounded-2xl border border-slate-100 p-10 md:p-14 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <HiCollection className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">
                No properties to show
              </h3>
              <p className="text-sm text-muted max-w-sm mx-auto mb-6">
                Start exploring properties and your recently viewed ones will
                appear here.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm"
              >
                <HiSearch className="w-4 h-4" />
                Browse Properties
              </Link>
            </motion.div>
          )}

          {/* Property Cards */}
          {!loading && recentProperties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {recentProperties.map((property, idx) => {
                const imageUrl = property.images?.[0] || "";
                return (
                  <motion.div
                    key={property._id}
                    custom={idx}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                  >
                    <Link
                      href={`/properties/${property._id}`}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <HiPhotograph className="w-10 h-10 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base font-bold text-secondary">
                          {formatPrice(property.price, property.priceType)}
                        </span>
                      </div>
                      <Link href={`/properties/${property._id}`}>
                        <h3 className="text-sm font-semibold text-dark line-clamp-1 mb-1 hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-muted">
                        <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs truncate">
                          {property.location.city}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
