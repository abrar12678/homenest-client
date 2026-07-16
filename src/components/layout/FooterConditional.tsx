"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function FooterConditional() {
  const pathname = usePathname();

  // Hide footer on all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return <Footer />;
}