"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Menu,
  X,
  Rocket,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Analytics & Reviews",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    description: "Cashflow & Stock",
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Sparkles,
    description: "AI Copywriter",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* ===== Mobile Top Bar ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[var(--surface)] border-b border-[var(--border)] backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">MikroBoost</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-10 w-10 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* ===== Mobile Overlay ===== */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[var(--sidebar-width)] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 ease-out",
          // mobile: off-screen by default
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--border)]">
          <div className="h-9 w-9 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center shadow-[var(--shadow-sm)]">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none">
              MikroBoost
            </h1>
            <p className="text-[10px] text-[var(--muted)] mt-0.5 tracking-wide uppercase">
              UMKM Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                  )}
                />
                <div>
                  <span className="block leading-tight">{item.label}</span>
                  <span className="block text-[10px] text-[var(--muted-foreground)] leading-tight mt-0.5">
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse-glow" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 border border-[var(--border)] p-3">
            <p className="text-xs font-medium text-[var(--foreground)]">
              Hackathon MVP
            </p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">
              Built with ❤️ for UMKM
            </p>
          </div>
        </div>
      </aside>

      {/* ===== Mobile Bottom Nav ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-around px-2 backdrop-blur-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[var(--radius-md)] transition-colors",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
