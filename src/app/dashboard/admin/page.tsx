"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
  HiUsers,
  HiUserGroup,
  HiHome,
  HiClock,
  HiMail,
  HiCurrencyDollar,
  HiShieldCheck,
  HiBan,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { getAdminStats, toggleAdminBan, updatePropertyStatus } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatNumber, formatDate, getPropertyTypeLabel } from "@/lib/utils";
import type { IAdminStats, IUser, IProperty } from "@/types";

const CHART_COLORS = ["#1E40AF", "#059669", "#F59E0B", "#EF4444"];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function AdminOverviewPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingBanId, setTogglingBanId] = useState<string | null>(null);
  const [updatingPropId, setUpdatingPropId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminStats();
      setStats(res.data.data || res.data);
    } catch {
      toast.error("Failed to load admin stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleToggleBan = async (userId: string, currentBan: boolean) => {
    try {
      setTogglingBanId(userId);
      await toggleAdminBan(userId);
      toast.success(`User ${currentBan ? "unbanned" : "banned"} successfully.`);
      fetchStats();
    } catch {
      toast.error("Failed to update user ban status.");
    } finally {
      setTogglingBanId(null);
    }
  };

  const handlePropertyStatus = async (propertyId: string, status: string) => {
    try {
      setUpdatingPropId(propertyId);
      await updatePropertyStatus(propertyId, status);
      toast.success(`Property ${status} successfully.`);
      fetchStats();
    } catch {
      toast.error("Failed to update property status.");
    } finally {
      setUpdatingPropId(null);
    }
  };

  // Chart data
  const roleChartData =
    stats?.usersByRole?.map((r) => ({
      name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
      count: r.count,
    })) || [];

  const typeChartData =
    stats?.propertiesByType?.map((t) => ({
      name: getPropertyTypeLabel(t._id),
      value: t.count,
    })) || [];

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: HiUsers,
      bg: "bg-blue-50",
      iconColor: "text-primary",
      border: "border-primary/20",
    },
    {
      label: "Total Agents",
      value: stats?.totalAgents ?? 0,
      icon: HiUserGroup,
      bg: "bg-emerald-50",
      iconColor: "text-secondary",
      border: "border-secondary/20",
    },
    {
      label: "Total Properties",
      value: stats?.totalProperties ?? 0,
      icon: HiHome,
      bg: "bg-amber-50",
      iconColor: "text-accent",
      border: "border-accent/20",
    },
    {
      label: "Pending Reviews",
      value: stats?.pendingProperties ?? 0,
      icon: HiClock,
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
      border: "border-orange-200",
    },
    {
      label: "Total Inquiries",
      value: stats?.totalInquiries ?? 0,
      icon: HiMail,
      bg: "bg-purple-50",
      iconColor: "text-purple-500",
      border: "border-purple-200",
    },
    {
      label: "Revenue",
      value: `৳${formatNumber(stats?.totalRevenue ?? 0)}`,
      icon: HiCurrencyDollar,
      bg: "bg-rose-50",
      iconColor: "text-rose-500",
      border: "border-rose-200",
    },
  ];

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "agent":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-dark p-6 md:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            Admin Panel
          </h1>
          <p className="text-blue-200 text-sm md:text-base">
            Welcome back, {user?.name || "Admin"} — manage your platform from
            one place
          </p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-xl mb-3" />
              <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
              <div className="h-6 bg-slate-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.label}
              custom={idx}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className="text-xs text-muted font-medium mb-1">
                {card.label}
              </p>
              <p className="text-lg md:text-xl font-bold text-dark">
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart — Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" as const }}
          className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 md:p-6"
        >
          <h3 className="text-base md:text-lg font-bold text-dark mb-4">
            Users by Role
          </h3>
          {loading ? (
            <div className="h-[280px] bg-slate-100 rounded-xl animate-pulse" />
          ) : roleChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={roleChartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {roleChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted text-center py-16">
              No data to display
            </p>
          )}
        </motion.div>

        {/* Pie Chart — Properties by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" as const }}
          className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 md:p-6"
        >
          <h3 className="text-base md:text-lg font-bold text-dark mb-4">
            Properties by Type
          </h3>
          {loading ? (
            <div className="h-[280px] bg-slate-100 rounded-xl animate-pulse" />
          ) : typeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({
                    name,
                    percent,
                  }: {
                    name: string;
                    percent?: number;
                  }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {typeChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted text-center py-16">
              No data to display
            </p>
          )}
        </motion.div>
      </div>

      {/* Recent Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" as const }}
        className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 md:p-6"
      >
        <h3 className="text-base md:text-lg font-bold text-dark mb-4">
          Recent Users
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-muted font-medium">
                    Name
                  </th>
                  <th className="text-left py-3 px-3 text-muted font-medium hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left py-3 px-3 text-muted font-medium">
                    Role
                  </th>
                  <th className="text-left py-3 px-3 text-muted font-medium hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right py-3 px-3 text-muted font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.slice(0, 5).map((u: IUser) => (
                  <tr
                    key={u._id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-dark">
                      {u.name}
                    </td>
                    <td className="py-3 px-3 text-muted hidden sm:table-cell">
                      {u.email}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold ${roleBadgeColor(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted text-xs hidden md:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleBan(u._id, !!u.isBanned)}
                        disabled={togglingBanId === u._id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                          u.isBanned
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-red-50 text-red-500 hover:bg-red-100"
                        }`}
                      >
                        {togglingBanId === u._id ? (
                          <svg
                            className="animate-spin h-3.5 w-3.5"
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
                              className="opacity.75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : u.isBanned ? (
                          <HiShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <HiBan className="w-3.5 h-3.5" />
                        )}
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-8">No users found.</p>
        )}
      </motion.div>

      {/* Recent Properties Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" as const }}
        className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 md:p-6"
      >
        <h3 className="text-base md:text-lg font-bold text-dark mb-4">
          Recent Properties
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : stats?.recentProperties && stats.recentProperties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-muted font-medium">
                    Title
                  </th>
                  <th className="text-left py-3 px-3 text-muted font-medium hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left py-3 px-3 text-muted font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-3 text-muted font-medium hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right py-3 px-3 text-muted font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProperties.slice(0, 5).map((p: IProperty) => (
                  <tr
                    key={p._id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-dark max-w-[200px] truncate">
                      {p.title}
                    </td>
                    <td className="py-3 px-3 text-muted hidden sm:table-cell capitalize">
                      {p.propertyType}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${statusBadge(p.status || "pending")}`}
                      >
                        {p.status || "pending"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted text-xs hidden md:table-cell">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {p.status !== "approved" && (
                          <button
                            onClick={() =>
                              handlePropertyStatus(p._id, "approved")
                            }
                            disabled={updatingPropId === p._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {updatingPropId === p._id ? (
                              <svg
                                className="animate-spin h-3.5 w-3.5"
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
                                  className="opacity.75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                            ) : (
                              <HiCheckCircle className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                        )}
                        {p.status !== "rejected" && (
                          <button
                            onClick={() =>
                              handlePropertyStatus(p._id, "rejected")
                            }
                            disabled={updatingPropId === p._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <HiXCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-8">
            No properties found.
          </p>
        )}
      </motion.div>
    </div>
  );
}
