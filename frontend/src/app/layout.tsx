import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
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
  title: "MikroBoost — Smart UMKM Platform",
  description:
    "Platform cerdas untuk UMKM: analitik penjualan, manajemen inventori, dan AI copywriter untuk marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <Sidebar />
        {/* Main content area — offset by sidebar on desktop, offset top/bottom on mobile */}
        <main className="flex-1 lg:ml-[var(--sidebar-width)] pt-14 pb-16 lg:pt-0 lg:pb-0 min-h-screen">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
