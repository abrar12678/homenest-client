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
  HiExclamationCircle,
  HiClock,
  HiCalendar,
  HiMailOpen,
  HiOfficeBuilding,
} from "react-icons/hi";
import {
  getMyProperties,
  getReceivedInquiries,
  getReceivedVisits,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  formatPrice,
  formatDate,
  formatNumber,
  getPropertyTypeLabel,
  getStarRating,
} from "@/lib/utils";
import type { IProperty, IInquiry, IVisit } from "@/types";

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "#EF4444",
];

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
  const [visits, setVisits] = useState<IVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, inqRes, visitsRes] = await Promise.all([
        getMyProperties(),
        getReceivedInquiries({ page: "1", limit: "3" }),
        getReceivedVisits({ page: "1", limit: "3" }),
      ]);
      const propsData = propsRes.data.data;
      setProperties(
        Array.isArray(propsData?.properties)
          ? propsData.properties
          : Array.isArray(propsData)
            ? propsData
            : []
      );
      const inqData = inqRes.data.data;
      setInquiries(
        Array.isArray(inqData?.inquiries)
          ? inqData.inquiries
          : Array.isArray(inqData)
            ? inqData
            : []
      );
      const visitData = visitsRes.data.data;
      setVisits(
        Array.isArray(visitData?.visits)
          ? visitData.visits
          : Array.isArray(visitData)
            ? visitData
            : []
      );
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
  const avgRating =
    properties.length > 0
      ? (
          properties.reduce((sum, p) => sum + (p.rating || 0), 0) /
          properties.length
        ).toFixed(1)
      : "0.0";
  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(
    (i) => i.status === "pending"
  ).length;
  const pendingVisits = visits.filter(
    (v) => v.status === "pending" || v.status === "confirmed"
  ).length;

  const stats = [
    {
      label: "Total Listings",
      value: formatNumber(properties.length),
      icon: HiHome,
      bg: "bg-primary/10",
      text: "text-primary",
    },
    {
      label: "Total Views",
      value: formatNumber(totalViews),
      icon: HiEye,
      bg: "bg-secondary/10",
      text: "text-secondary",
    },
    {
      label: "Avg Rating",
      value: avgRating,
      icon: HiStar,
      bg: "bg-accent/10",
      text: "text-accent",
    },
    {
      label: "Total Inquiries",
      value: formatNumber(totalInquiries),
      icon: HiMail,
      bg: "bg-primary-light/10",
      text: "text-primary-light",
    },
    {
      label: "Pending Inquiries",
      value: formatNumber(pendingInquiries),
      icon: HiExclamationCircle,
      bg: "bg-amber-500/10",
      text: "text-amber-600",
    },
    {
      label: "Pending Visits",
      value: formatNumber(pendingVisits),
      icon: HiClock,
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
    },
  ];

  const quickActions = [
    {
      label: "Add New Property",
      description: "List a new property for sale or rent",
      icon: HiPlusCircle,
      href: "/properties/new",
      bg: "bg-primary/10",
      text: "text-primary",
      hoverBorder: "hover:border-primary/30",
    },
    {
      label: "View Inquiries",
      description: "Review and respond to buyer messages",
      icon: HiMail,
      href: "/dashboard/seller/inquiries",
      bg: "bg-secondary/10",
      text: "text-secondary",
      hoverBorder: "hover:border-secondary/30",
    },
    {
      label: "Manage Visits",
      description: "Schedule and manage property visits",
      icon: HiClock,
      href: "/dashboard/seller/visits",
      bg: "bg-accent/10",
      text: "text-accent",
      hoverBorder: "hover:border-accent/30",
    },
  ];

  const viewsChartData = [...properties]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6)
    .map((p) => ({
      name: p.title.length > 14 ? p.title.slice(0, 14) + "..." : p.title,
      views: p.views || 0,
    }));

  const typeCount: Record<string, number> = {};
  properties.forEach((p) => {
    const label = getPropertyTypeLabel(p.propertyType);
    typeCount[label] = (typeCount[label] || 0) + 1;
  });
  const pieData = Object.entries(typeCount).map(([name, value]) => ({
    name,
    value,
  }));

  const recentListings = [...properties]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  const upcomingVisits = visits.filter(
    (v) => v.status === "pending" || v.status === "confirmed"
  );

  const statusColor = (status?: string) => {
    switch (status) {
      case "approved":
      case "confirmed":
      case "completed":
      case "replied":
        return "bg-green-100 text-green-700";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const inquiryStatusColor = (status?: string) => {
    switch (status) {
      case "replied":
        return "bg-green-100 text-green-700";
      case "pending":
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const visitStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  /* ─────────────────── Loading Skeleton ─────────────────── */
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-44 md:h-52 rounded-2xl bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
          <div className="h-80 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
          <div className="h-72 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ─────────────────── Main Content ─────────────────── */
  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-light px-6 py-10 md:px-10 md:py-14"
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
              <HiOfficeBuilding className="w-3.5 h-3.5" />
              Agent Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name || "Agent"}
          </h1>
          <p className="text-blue-100/80 max-w-xl text-sm md:text-base leading-relaxed">
            Here is an overview of your property listings, views, and buyer
            inquiries. Keep your listings updated for better visibility and
            engagement.
          </p>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            custom={idx}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex flex-col items-center sm:items-start gap-2.5 md:flex-row md:gap-3">
              <div
                className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center shrink-0`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[11px] md:text-xs text-muted font-medium truncate">
                  {stat.label}
                </p>
                <p className="text-lg md:text-xl font-bold text-dark">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action, idx) => (
          <motion.div
            key={action.label}
            custom={idx + 6}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <Link
              href={action.href}
              className={`block bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md ${action.hoverBorder} transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${action.bg} ${action.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-dark group-hover:text-primary transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">
                    {action.description}
                  </p>
                </div>
                <HiArrowRight className="w-4 h-4 text-muted ml-auto shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          custom={9}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <HiChartBar className="w-5 h-5 text-primary" />
              <h3 className="text-base md:text-lg font-bold text-dark">
                Property Views
              </h3>
            </div>
            {properties.length > 6 && (
              <span className="text-xs text-muted">
                Top 6 by views
              </span>
            )}
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
                  tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={55}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="views"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                  name="Views"
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <HiEye className="w-7 h-7 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-dark mb-1">
                No view data yet
              </p>
              <p className="text-xs text-muted">
                Views will appear once your listings get traffic.
              </p>
            </div>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          custom={10}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <h3 className="text-base md:text-lg font-bold text-dark mb-5">
            Property Types
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
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
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                <HiHome className="w-7 h-7 text-accent/40" />
              </div>
              <p className="text-sm font-medium text-dark mb-1">
                No type data yet
              </p>
              <p className="text-xs text-muted">
                Add properties to see type distribution.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <motion.div
          custom={11}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiMailOpen className="w-5 h-5 text-primary" />
              <h3 className="text-base md:text-lg font-bold text-dark">
                Recent Inquiries
              </h3>
            </div>
            <Link
              href="/dashboard/seller/inquiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
            >
              View All
              <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <HiMail className="w-6 h-6 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-dark mb-0.5">
                No inquiries yet
              </p>
              <p className="text-xs text-muted">
                Inquiries will appear when buyers reach out.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-bold">
                      {inquiry.fromUserName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-dark truncate">
                        {inquiry.fromUserName || "Unknown"}
                      </p>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${inquiryStatusColor(inquiry.status)}`}
                      >
                        {inquiry.status || "pending"}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate mb-1">
                      Re: {inquiry.propertyTitle || "Untitled Property"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(inquiry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Visits */}
        <motion.div
          custom={12}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiCalendar className="w-5 h-5 text-secondary" />
              <h3 className="text-base md:text-lg font-bold text-dark">
                Upcoming Visits
              </h3>
            </div>
            <Link
              href="/dashboard/seller/visits"
              className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-green-700 transition-colors cursor-pointer"
            >
              View All
              <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {upcomingVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-3">
                <HiCalendar className="w-6 h-6 text-secondary/40" />
              </div>
              <p className="text-sm font-medium text-dark mb-0.5">
                No upcoming visits
              </p>
              <p className="text-xs text-muted">
                Scheduled visits will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {upcomingVisits.slice(0, 3).map((visit) => (
                <div
                  key={visit._id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-bold">
                      {visit.visitorName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-dark truncate">
                        {visit.visitorName || "Unknown"}
                      </p>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${visitStatusColor(visit.status)}`}
                      >
                        {visit.status || "pending"}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate mb-1">
                      {visit.propertyTitle || "Untitled Property"}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <HiCalendar className="w-3 h-3" />
                        {formatDate(visit.preferredDate)}
                      </span>
                      {visit.preferredTime && (
                        <span className="flex items-center gap-1">
                          <HiClock className="w-3 h-3" />
                          {visit.preferredTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Recent Listings ── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg md:text-xl font-bold text-dark">
            Recent Listings
          </h2>
          <Link
            href="/dashboard/seller/listings"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-dark text-sm font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer w-fit"
          >
            View All
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiHome className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="text-base font-semibold text-dark mb-1">
              No listings yet
            </h3>
            <p className="text-sm text-muted mb-5">
              Create your first property listing to get started.
            </p>
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
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
                  custom={idx + 13}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <Link
                    href={`/properties/${property._id}`}
                    className="block cursor-pointer"
                  >
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
                    </div>
                  </Link>
                  <div className="p-3.5">
                    <p className="text-sm font-bold text-secondary mb-1">
                      {formatPrice(property.price, property.priceType)}
                    </p>
                    <Link
                      href={`/properties/${property._id}`}
                      className="cursor-pointer block"
                    >
                      <h3 className="text-xs font-semibold text-dark line-clamp-1 mb-1 hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-muted mb-2">
                      <HiLocationMarker className="w-3 h-3 shrink-0" />
                      <span className="text-[11px] truncate">
                        {property.location?.area}
                        {property.location?.area && property.location?.city
                          ? ", "
                          : ""}
                        {property.location?.city}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-0.5">
                          <HiEye className="w-3 h-3" />
                          {formatNumber(property.views)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <HiStar className="w-3 h-3 text-accent" />
                          {getStarRating(property.rating)}
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