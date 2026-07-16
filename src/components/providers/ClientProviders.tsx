"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/layout/Navbar";
import FooterConditional from "@/components/layout/FooterConditional";
import AuthInitializer from "@/components/providers/AuthInitializer";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthInitializer>
      <Navbar />
      <main className="min-h-screen flex-1">{children}</main>
      <FooterConditional />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!rounded-xl !shadow-lg !border !border-slate-100 !backdrop-blur-sm !text-sm !font-medium"
        progressClassName="!h-1 !rounded-full"
      />
    </AuthInitializer>
  );
}