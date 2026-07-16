"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import AdminGuard from "@/components/dashboard/AdminGuard";
import { HiMenu } from "react-icons/hi";
import { useAuthStore } from "@/lib/store";

const rolePageTitles: Record<string, Record<string, string>> = {
  buyer: {
    "/dashboard/buyer": "Buyer Dashboard",
    "/dashboard/buyer/favorites": "My Favorites",
    "/dashboard/buyer/inquiries": "My Inquiries",
    "/dashboard/buyer/visits": "My Visits",
    "/dashboard/buyer/profile": "My Profile",
  },
  seller: {
    "/dashboard/seller": "Agent Dashboard",
    "/dashboard/seller/listings": "My Listings",
    "/dashboard/seller/inquiries": "Inquiries",
    "/dashboard/seller/visits": "Visit Requests",
    "/dashboard/seller/profile": "My Profile",
  },
  admin: {
    "/dashboard/admin": "Admin Dashboard",
    "/dashboard/admin/users": "Users",
    "/dashboard/admin/properties": "Properties",
    "/dashboard/admin/inquiries": "Inquiries",
    "/dashboard/admin/reviews": "Reviews",
    "/dashboard/admin/messages": "Messages",
    "/dashboard/admin/payments": "Payments",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const role = user?.role || "user";
  const roleKey = role === "agent" ? "seller" : role;
  const isAdmin = role === "admin";

  let pageTitle = "Dashboard";
  if (rolePageTitles[roleKey]) {
    if (rolePageTitles[roleKey][pathname]) {
      pageTitle = rolePageTitles[roleKey][pathname];
    } else {
      for (const [path, title] of Object.entries(
        rolePageTitles[roleKey] as Record<string, string>
      )) {
        if (pathname.startsWith(path)) {
          pageTitle = title;
          break;
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <HiMenu className="w-5 h-5 text-dark" />
        </button>
        <motion.h1
          key={pageTitle}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" as const }}
          className="text-base font-semibold text-dark truncate"
        >
          {pageTitle}
        </motion.h1>
      </div>

      {/* Main content - extra top padding on mobile for sticky bar */}
      <main className="lg:pl-64">
        <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-[72px]">
          {isAdmin ? <AdminGuard>{children}</AdminGuard> : children}
        </div>
      </main>
    </div>
  );
}