"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiHome,
  HiMenu,
  HiX,
  HiLogout,
  HiChevronDown,
  HiViewGrid,
} from "react-icons/hi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMobileOpen(false);
      setDropdownOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = () => setDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  // Role-based nav links
  const navLinks = useMemo(() => {
    const base = [
      { href: "/", label: "Home" },
      { href: "/properties", label: "Explore Properties" },
    ];

    if (!isAuthenticated || !user) {
      return [
        ...base,
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ];
    }

    if (user.role === "user") {
      return [
        ...base,
        { href: "/dashboard/buyer", label: "My Dashboard" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ];
    }

    if (user.role === "agent") {
      return [
        ...base,
        { href: "/dashboard/seller", label: "My Dashboard" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ];
    }

    // admin
    return [
      ...base,
      { href: "/dashboard/admin", label: "Admin Panel" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ];
  }, [isAuthenticated, user]);

  // Dashboard link and label based on role
  const dashboardLink = useMemo(() => {
    if (!user) return { href: "/dashboard", label: "My Dashboard" };
    switch (user.role) {
      case "admin":
        return { href: "/dashboard/admin", label: "Admin Panel" };
      case "agent":
        return { href: "/dashboard/seller", label: "My Dashboard" };
      default:
        return { href: "/dashboard/buyer", label: "My Dashboard" };
    }
  }, [user]);

  const showAddPropertyButton = false;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <HiHome className="w-7 h-7 text-primary group-hover:text-primary-light transition-colors" />
              <span className="text-xl font-bold text-dark">
                Home<span className="text-primary">Nest</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive(link.href)
                      ? "text-primary bg-primary/5"
                      : "text-dark hover:text-primary hover:bg-gray-50 hover:scale-[1.02]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(!dropdownOpen);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-dark max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <HiChevronDown
                        className={`w-4 h-4 text-muted transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-dark">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                          <Link
                            href={dashboardLink.href}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-dark hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:pl-5"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <HiViewGrid className="w-4 h-4" />
                            {dashboardLink.label}
                          </Link>
                          <button
                            onClick={() => {
                              clearAuth();
                              toast.success("Logged out successfully!");
                              window.location.href = "/";
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer hover:pl-5"
                          >
                            <HiLogout className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer hover:scale-110"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <HiX className="w-6 h-6 text-dark" />
              ) : (
                <HiMenu className="w-6 h-6 text-dark" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Drawer */}
            <motion.div
              className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-100 max-h-[calc(100vh-4rem)] overflow-y-auto"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive(link.href)
                          ? "text-primary bg-primary/5"
                          : "text-dark hover:text-primary hover:bg-gray-50 hover:translate-x-1"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t border-gray-100 mt-3 pt-3">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href={dashboardLink.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-dark hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer hover:translate-x-1">
                          <HiViewGrid className="w-5 h-5" />
                          {dashboardLink.label}
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          clearAuth();
                          setMobileOpen(false);
                          toast.success("Logged out successfully!");
                          window.location.href = "/";
                        }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer hover:translate-x-1"
                      >
                        <HiLogout className="w-5 h-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2 px-4">
                      <Link href="/login" className="block">
                        <Button variant="outline" fullWidth>
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" className="block">
                        <Button variant="primary" fullWidth>
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
