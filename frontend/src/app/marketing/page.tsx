"use client";

import React, { useState } from "react";
import { Wand2, TrendingUp, Video } from "lucide-react";
import { CopywriterTab } from "@/components/marketing/CopywriterTab";
import { TrendAnalysisTab } from "@/components/marketing/TrendAnalysisTab";
import { CreativeHooksTab } from "@/components/marketing/CreativeHooksTab";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"copywriter" | "trends" | "hooks">(
    "copywriter"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Marketing Studio</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Hasilkan caption, analisis tren pasar, dan storyboard video pemasaran dengan bantuan AI.
        </p>
      </div>

      {/* ===== Navigation Tabs ===== */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("copywriter")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
            activeTab === "copywriter"
              ? "bg-[var(--primary)] text-white shadow-md"
              : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          <Wand2 className="h-4 w-4" />
          AI Copywriter
        </button>
        <button
          onClick={() => setActiveTab("trends")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
            activeTab === "trends"
              ? "bg-[var(--primary)] text-white shadow-md"
              : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Analisis Tren Pasar
        </button>
        <button
          onClick={() => setActiveTab("hooks")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
            activeTab === "hooks"
              ? "bg-[var(--primary)] text-white shadow-md"
              : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          <Video className="h-4 w-4" />
          Creative Video Hooks
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "copywriter" && <CopywriterTab />}
      {activeTab === "trends" && <TrendAnalysisTab />}
      {activeTab === "hooks" && <CreativeHooksTab />}
    </div>
  );
}
