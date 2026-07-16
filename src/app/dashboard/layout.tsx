"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  HiMenu,
  HiHome,
  HiLogout,
  HiChevronDown,
  HiArrowLeft,
  HiCog,
} from "react-icons/hi";
import { useAuthStore } from "@/lib/store";

const rolePageTitles: Record<string, Record<string, string>> = {
  buyer: {
    "/dashboard/buyer": "Buyer Dashboard",
    "/dashboard/buyer/favorites": "My Favorites",
    "/dashboard/buyer/inquiries": "My Inquiries",
    "/dashboard/buyer/profile": "My Profile",
  },
  seller: {
    "/dashboard/seller": "Agent Dashboard",
    "/dashboard/seller/listings": "My Listings",
    "/dashboard/seller/inquiries": "Inquiries",
    "/dashboard/seller/profile": "My Profile",
  },
  admin: {
    "/dashboard/admin": "Admin Dashboard",
    "/dashboard/admin/users": "Users",
    "/dashboard/admin/properties": "Properties",
    "/dashboard/admin/reviews": "Reviews",
    "/dashboard/admin/messages": "Messages",
    "/dashboard/admin/payments": "Payments",
  },
};

const roleLabels: Record<string, string> = {
  user: "Buyer",
  agent: "Agent",
  admin: "Admin",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, clearAuth } = useAuthStore();

  const role = user?.role || "user";
  const roleKey = role === "agent" ? "seller" : role;

  // Resolve page title
  let pageTitle = "Dashboard";
  if (rolePageTitles[roleKey]) {
    if (rolePageTitles[roleKey][pathname]) {
      pageTitle = rolePageTitles[roleKey][pathname];
    } else {
      for (const [path, title] of Object.entries(
        rolePageTitles[roleKey] as Record<string, string>,
      )) {
        if (pathname.startsWith(path)) {
          pageTitle = title;
          break;
        }
      }
    }
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Prevent body scroll when sidebar is open (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const dashboardLink =
    role === "admin"
      ? "/dashboard/admin"
      : role === "agent"
        ? "/dashboard/seller"
        : "/dashboard/buyer";

  return (
    <div className="min-h-screen bg-neutral">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ─── Dashboard Header Bar ─── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6">
          {/* Left: hamburger + logo + title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Hamburger — visible on small/medium, hidden on large (sidebar always open) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer shrink-0"
              aria-label="Open sidebar"
            >
              <HiMenu className="w-5 h-5 text-dark" />
            </button>

            {/* Logo — always visible */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <HiHome className="w-6 h-6 text-primary group-hover:text-primary-light transition-colors" />
              <span className="text-lg font-bold text-dark hidden sm:inline">
                Home<span className="text-primary">Nest</span>
              </span>
            </Link>

            {/* Separator + Page Title */}
            <div className="hidden sm:flex items-center gap-2.5 min-w-0 ml-2">
              <span className="text-slate-300">/</span>
              <motion.h1
                key={pageTitle}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" as const }}
                className="text-sm font-semibold text-dark truncate"
              >
                {pageTitle}
              </motion.h1>
            </div>

            {/* Mobile: only page title (no logo text) */}
            <motion.h1
              key={pageTitle + "-mobile"}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" as const }}
              className="sm:hidden text-sm font-semibold text-dark truncate"
            >
              {pageTitle}
            </motion.h1>
          </div>

          {/* Right: user menu */}
          {user && (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-dark max-w-[100px] md:max-w-[140px] truncate hidden md:inline">
                  {user.name}
                </span>
                <HiChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" as const }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-dark truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                        {roleLabels[role]}
                      </span>
                    </div>

                    {/* Dashboard link */}
                    <Link
                      href={dashboardLink}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-dark hover:bg-slate-50 transition-colors"
                    >
                      <HiCog className="w-4 h-4 text-muted" />
                      Dashboard Home
                    </Link>

                    {/* Back to site */}
                    <Link
                      href="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-dark hover:bg-slate-50 transition-colors"
                    >
                      <HiArrowLeft className="w-4 h-4 text-muted" />
                      Back to Website
                    </Link>

                    {/* Logout */}
                    <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                      <button
                        onClick={() => {
                          clearAuth();
                          setUserMenuOpen(false);
                          router.push("/");
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <HiLogout className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="lg:pl-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
