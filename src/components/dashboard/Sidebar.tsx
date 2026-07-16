"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import {
  HiHome,
  HiHeart,
  HiMail,
  HiUser,
  HiClipboardList,
  HiUsers,
  HiOfficeBuilding,
  HiStar,
  HiChat,
  HiCreditCard,
  HiX,
} from "react-icons/hi";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const buyerNavItems: NavItem[] = [
  { href: "/dashboard/buyer", label: "Overview", icon: HiHome },
  { href: "/dashboard/buyer/favorites", label: "My Favorites", icon: HiHeart },
  { href: "/dashboard/buyer/inquiries", label: "My Inquiries", icon: HiMail },
  { href: "/dashboard/buyer/profile", label: "Profile", icon: HiUser },
];

const agentNavItems: NavItem[] = [
  { href: "/dashboard/seller", label: "Overview", icon: HiHome },
  {
    href: "/dashboard/seller/listings",
    label: "My Listings",
    icon: HiClipboardList,
  },
  { href: "/dashboard/seller/inquiries", label: "Inquiries", icon: HiMail },
  { href: "/dashboard/seller/profile", label: "Profile", icon: HiUser },
];

const adminNavItems: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: HiHome },
  { href: "/dashboard/admin/users", label: "Users", icon: HiUsers },
  {
    href: "/dashboard/admin/properties",
    label: "Properties",
    icon: HiOfficeBuilding,
  },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: HiStar },
  { href: "/dashboard/admin/messages", label: "Messages", icon: HiChat },
  { href: "/dashboard/admin/payments", label: "Payments", icon: HiCreditCard },
];

const roleBadgeColors: Record<string, string> = {
  user: "bg-blue-100 text-primary",
  agent: "bg-green-100 text-secondary",
  admin: "bg-amber-100 text-accent",
};

const roleLabels: Record<string, string> = {
  user: "Buyer",
  agent: "Agent",
  admin: "Admin",
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const role = user?.role || "user";
  const navItems =
    role === "admin"
      ? adminNavItems
      : role === "agent"
        ? agentNavItems
        : buyerNavItems;

  const isActive = (href: string) => {
    if (
      href ===
      `/dashboard/${role === "agent" ? "seller" : role === "admin" ? "admin" : "buyer"}`
    ) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <HiHome className="w-7 h-7 text-primary" />
        <span className="text-xl font-bold text-dark">
          Home<span className="text-primary">Nest</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const active = isActive(item.href);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: idx * 0.05,
                ease: "easeOut" as const,
              }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "text-white bg-primary shadow-md shadow-primary/25"
                    : "text-dark hover:text-primary hover:bg-primary/5"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${active ? "text-white" : ""}`}
                />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-dark truncate">
                {user.name}
              </p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleBadgeColors[role]}`}
              >
                {roleLabels[role]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-primary/5 transition-colors w-full cursor-pointer lg:hidden"
          >
            <HiX className="w-4 h-4" />
            Close Menu
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar (lg+) — always visible, below header */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 lg:left-0 w-64 bg-white border-r border-slate-100 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" as const }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" as const }}
              className="fixed inset-y-0 left-0 w-72 sm:w-64 bg-white shadow-2xl z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
