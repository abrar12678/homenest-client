"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== "admin") {
      router.replace("/dashboard/buyer");
    }
  }, [user, isAuthenticated, router]);

  // Show nothing while checking auth or if not admin
  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}