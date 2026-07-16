"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiHome,
  HiShieldCheck,
  HiUsers,
  HiStar,
  HiArrowRight,
  HiArrowLeft,
} from "react-icons/hi";

/* ─── Design card content for each mode ─── */
function LoginDesignCard() {
  return (
    <>
      <h1 className="text-3xl xl:text-4xl font-bold text-white mb-5 leading-tight">
        Find Your Perfect <br />
        <span className="text-accent-light">Home in Bangladesh</span>
      </h1>
      <p className="text-blue-100 text-base leading-relaxed mb-10 max-w-md">
        Discover thousands of verified properties across Dhaka, Chittagong, Sylhet, and more.
        Your dream home is just a click away.
      </p>
      <div className="space-y-4">
        {[
          { icon: HiShieldCheck, label: "10,000+ Verified Listings" },
          { icon: HiUsers, label: "5,000+ Happy Clients" },
          { icon: HiStar, label: "4.8 Average Rating" },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-accent-light" />
            </div>
            <span className="text-blue-50 text-sm font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <p className="text-blue-200/60 text-sm mb-3">New to HomeNest?</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-white font-semibold text-sm group"
        >
          Create an account
          <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </>
  );
}

function RegisterDesignCard() {
  return (
    <>
      <h1 className="text-3xl xl:text-4xl font-bold text-white mb-5 leading-tight">
        Join Bangladesh&apos;s <br />
        <span className="text-accent-light">Fastest Growing</span>
        <br /> Property Platform
      </h1>
      <p className="text-blue-100 text-base leading-relaxed mb-10 max-w-md">
        Create your free account and get instant access to verified properties, personalized
        recommendations, and exclusive deals across Bangladesh.
      </p>
      <div className="space-y-4">
        {[
          { icon: HiShieldCheck, label: "Secure & verified platform" },
          { icon: HiUsers, label: "Join 5,000+ active users" },
          { icon: HiStar, label: "List your properties for free" },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-accent-light" />
            </div>
            <span className="text-blue-50 text-sm font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <p className="text-blue-200/60 text-sm mb-3">Already have an account?</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white font-semibold text-sm group"
        >
          <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Sign in instead
        </Link>
      </motion.div>
    </>
  );
}

/* ─── Shared decorative background ─── */
function DecorativeShapes() {
  return (
    <>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-white/5 rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-white/5 rounded-full" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}

/* ─── Main Auth Layout ─── */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  const spring = {
    type: "spring" as const,
    stiffness: 180,
    damping: 26,
    mass: 0.85,
  };

  return (
    <main className="h-screen relative overflow-hidden bg-white">
      <AnimatePresence mode="sync">
        {/* ─── DESIGN CARD (desktop only) — slides left↔right ─── */}
        <motion.div
          key={isLogin ? "design-left" : "design-right"}
          className="hidden lg:flex lg:w-1/2 absolute inset-y-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden z-10"
          style={{ left: isLogin ? 0 : "50%" }}
          initial={{ x: isLogin ? "-100%" : "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLogin ? "100%" : "-100%", opacity: 0 }}
          transition={spring}
        >
          <DecorativeShapes />
          <div className="relative z-10 flex flex-col justify-center h-full px-10 xl:px-16 py-10 xl:py-16">
            <div className={`max-w-md ${isLogin ? "" : "ml-auto"}`}>
              {isLogin ? <LoginDesignCard /> : <RegisterDesignCard />}
            </div>
          </div>
        </motion.div>

        {/* ─── FORM PANEL (desktop) — slides opposite to card ─── */}
        <motion.div
          key={isLogin ? "form-right" : "form-left"}
          className="hidden lg:block absolute inset-y-0 overflow-hidden z-20"
          style={{ left: isLogin ? "50%" : 0, width: "50%" }}
          initial={{ x: isLogin ? "100%" : "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLogin ? "-100%" : "100%", opacity: 0 }}
          transition={spring}
        >
          <div className="h-full flex flex-col justify-center px-10 xl:px-16 py-10 xl:py-16 overflow-hidden">
            <motion.div
              className={`w-full max-w-md ${isLogin ? "ml-auto" : "mr-auto"}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>

        {/* ─── MOBILE FORM (mobile only) — simple fade+slide ─── */}
        <motion.div
          key={pathname + "-mobile"}
          className="block lg:hidden h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-20"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          <div className="min-h-full flex flex-col items-center justify-start p-6 sm:p-8 pt-10">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <HiHome className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-dark tracking-tight">
                    Home<span className="text-primary">Nest</span>
                  </span>
                </Link>
              </div>
              {children}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}