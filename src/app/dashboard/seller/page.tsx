"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  HiHome,
  HiEye,
  HiStar,
  HiMail,
  HiPlusCircle,
  HiLocationMarker,
  HiPhotograph,
  HiArrowRight,
  HiChartBar,
} from "react-icons/hi";
import { getMyProperties, getReceivedInquiries } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  formatPrice,
  formatDate,
  formatNumber,
  getPropertyTypeLabel,
} from "@/lib/utils";
import type { IProperty, IInquiry } from "@/types";

const CHART_COLORS = ["#1E40AF", "#059669", "#F59E0B", "#EF4444"];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, inqRes] = await Promise.all([
        getMyProperties(),
        getReceivedInquiries(),
      ]);
      setProperties(propsRes.data.data?.properties || propsRes.data.data || []);
      setInquiries(inqRes.data.data?.inquiries || inqRes.data.data || []);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
  const avgRating =
    properties.length > 0
      ? (
          properties.reduce((sum, p) => sum + p.rating, 0) / properties.length
        ).toFixed(1)
      : "0.0";
  const pendingInquiries = inquiries.filter(
    (i) => i.status === "pending",
  ).length;

  const stats = [
    {
      label: "Total Listings",
      value: formatNumber(properties.length),
      icon: HiHome,
      bg: "bg-[#1E40AF]/10",
      text: "text-[#1E40AF]",
    },
    {
      label: "Total Views",
      value: formatNumber(totalViews),
      icon: HiEye,
      bg: "bg-[#059669]/10",
      text: "text-[#059669]",
    },
    {
      label: "Avg Rating",
      value: avgRating,
      icon: HiStar,
      bg: "bg-[#F59E0B]/10",
      text: "text-[#F59E0B]",
    },
    {
      label: "Inquiries",
      value: formatNumber(pendingInquiries),
      icon: HiMail,
      bg: "bg-[#EF4444]/10",
      text: "text-[#EF4444]",
    },
  ];

  // Bar chart: views per property
  const viewsChartData = properties.slice(0, 6).map((p) => ({
    name: p.title.length > 16 ? p.title.slice(0, 16) + "…" : p.title,
    views: p.views,
  }));

  // Pie chart: property type distribution
  const typeCount: Record<string, number> = {};
  properties.forEach((p) => {
    const label = getPropertyTypeLabel(p.propertyType);
    typeCount[label] = (typeCount[label] || 0) + 1;
  });
  const pieData = Object.entries(typeCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Recent 4 listings
  const recentListings = properties.slice(0, 4);

  const statusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Banner skeleton */}
        <div className="h-44 md:h-52 rounded-2xl bg-slate-200 animate-pulse" />
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse"
            />
          ))}
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
          <div className="h-80 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] px-6 py-10 md:px-10 md:py-14"
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">
            Agent Dashboard
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name || "Agent"} 👋
          </h1>
          <p className="text-blue-100/80 max-w-xl text-sm md:text-base">
            Here&apos;s an overview of your property listings, views, and buyer
            inquiries. Keep your listings updated for better visibility.
          </p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            custom={idx}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center shrink-0`}
              >
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-[#64748B] font-medium truncate">
                  {stat.label}
                </p>
                <p className="text-xl md:text-2xl font-bold text-[#1E293B]">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section — only if properties exist */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" as const }}
            className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <HiChartBar className="w-5 h-5 text-[#1E40AF]" />
              <h3 className="text-base md:text-lg font-bold text-[#1E293B]">
                Property Views
              </h3>
            </div>
            {viewsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={viewsChartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar
                    dataKey="views"
                    fill="#1E40AF"
                    radius={[8, 8, 0, 0]}
                    name="Views"
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#64748B] text-center py-12">
                No view data yet
              </p>
            )}
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" as const }}
            className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm"
          >
            <h3 className="text-base md:text-lg font-bold text-[#1E293B] mb-5">
              Property Types
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#64748B] text-center py-12">
                No type data yet
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* My Recent Listings */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg md:text-xl font-bold text-[#1E293B]">
            My Recent Listings
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E40AF] text-white text-sm font-semibold rounded-2xl hover:bg-[#1E3A8A] transition-colors shadow-sm shadow-[#1E40AF]/20"
            >
              <HiPlusCircle className="w-4 h-4" />
              Add New Property
            </Link>
            <Link
              href="/dashboard/seller/listings"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#1E293B] text-sm font-semibold rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              View All
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {recentListings.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-[#1E40AF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiHome className="w-8 h-8 text-[#1E40AF]/50" />
            </div>
            <h3 className="text-base font-semibold text-[#1E293B] mb-1">
              No listings yet
            </h3>
            <p className="text-sm text-[#64748B] mb-5">
              Create your first property listing to get started.
            </p>
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1E40AF] text-white text-sm font-semibold rounded-2xl hover:bg-[#1E3A8A] transition-colors"
            >
              <HiPlusCircle className="w-4 h-4" />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentListings.map((property, idx) => {
              const imageUrl = property.images?.[0] || "";
              return (
                <motion.div
                  key={property._id}
                  custom={idx}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <Link href={`/properties/${property._id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <HiPhotograph className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      {property.status && (
                        <span
                          className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold capitalize ${statusColor(property.status)}`}
                        >
                          {property.status}
                        </span>
                      )}
                      {property.isFeatured && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#F59E0B] text-white">
                          Featured
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3.5">
                    <p className="text-sm font-bold text-[#059669] mb-1">
                      {formatPrice(property.price, property.priceType)}
                    </p>
                    <Link href={`/properties/${property._id}`}>
                      <h3 className="text-xs font-semibold text-[#1E293B] line-clamp-1 mb-1 hover:text-[#1E40AF] transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-[#64748B] mb-2">
                      <HiLocationMarker className="w-3 h-3 shrink-0" />
                      <span className="text-[11px] truncate">
                        {property.location.area}, {property.location.city}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-0.5">
                          <HiEye className="w-3 h-3" />
                          {formatNumber(property.views)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <HiStar className="w-3 h-3 text-[#F59E0B]" />
                          {property.rating}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {formatDate(property.createdAt)}
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
  );
}
