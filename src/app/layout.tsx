import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthInitializer from "@/components/providers/AuthInitializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeNest - Find Your Perfect Home",
  description:
    "Discover thousands of verified properties across Bangladesh. Find apartments, villas, commercial spaces, and land on HomeNest — the trusted property listing platform.",
  keywords: [
    "property",
    "Bangladesh",
    "real estate",
    "apartment",
    "Dhaka",
    "rent",
    "buy",
    "HomeNest",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <AuthInitializer>
          <Navbar />
          <main className="min-h-screen flex-1">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </AuthInitializer>
      </body>
    </html>
  );
}