"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/useStore";
import { uploadReviews } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Star,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const sentimentMap = {
  positive: { label: "Positif", variant: "success" as const },
  neutral: { label: "Netral", variant: "warning" as const },
  negative: { label: "Negatif", variant: "danger" as const },
};

export default function DashboardPage() {
  const { toast } = useToast();
  const {
    dashboardStats,
    reviews,
    reviewsSummary,
    loadDashboardStats,
    loadReviews,
    loadReviewsSummary,
  } = useStore();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDashboardStats();
    loadReviews();
    loadReviewsSummary();
  }, [loadDashboardStats, loadReviews, loadReviewsSummary]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadReviews(file);
      if (res.status === "success") {
        await Promise.all([
          loadDashboardStats(),
          loadReviews(),
          loadReviewsSummary(),
        ]);
        toast(res.message || "Ulasan berhasil diunggah!", "success");
      } else {
        toast(res.message || "Gagal mengunggah file ulasan", "error");
      }
    } catch (err: any) {
      toast("Terjadi kesalahan saat mengunggah berkas ulasan: " + err.message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const statsData = [
    {
      label: "Total Revenue",
      value: dashboardStats ? formatCurrency(dashboardStats.total_revenue) : "Rp 0",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: dashboardStats ? String(dashboardStats.orders_count) : "0",
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      label: "Total Products",
      value: dashboardStats ? String(dashboardStats.products_count) : "0",
      change: "+3.1%",
      trend: "up" as const,
      icon: Users,
    },
    {
      label: "Avg. Rating",
      value: reviewsSummary
        ? String(reviewsSummary.avg_rating)
        : dashboardStats
        ? String(dashboardStats.avg_rating)
        : "4.6",
      change: "+0.1",
      trend: "up" as const,
      icon: Star,
    },
  ];

  const posPct = reviewsSummary ? reviewsSummary.positive_pct : 68;
  const neuPct = reviewsSummary ? reviewsSummary.neutral_pct : 22;
  const negPct = reviewsSummary ? reviewsSummary.negative_pct : 10;
  const aiInsight = reviewsSummary
    ? reviewsSummary.ai_insight
    : "Sentimen positif mencapai 68%. Pelanggan paling puas dengan kualitas produk.";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.xls,.xlsx"
        className="hidden"
      />

      {/* ===== Page Header ===== */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Ringkasan analitik penjualan & review toko Anda.
        </p>
      </div>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        {statsData.map((stat) => (
          <Card key={stat.label} className="group relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--primary)]/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-[var(--primary)]" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--success)]" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-[var(--danger)]" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.trend === "up"
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  vs bulan lalu
                </span>
              </div>
            </CardContent>
            {/* Decorative gradient corner */}
            <div className="absolute -top-8 -right-8 h-16 w-16 rounded-full bg-[var(--primary)]/5 group-hover:bg-[var(--primary)]/10 transition-colors duration-300" />
          </Card>
        ))}
      </div>

      {/* ===== Reviews Section ===== */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Review List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Review Terbaru</CardTitle>
                <CardDescription>
                  Analisis sentimen otomatis dari review pelanggan
                </CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    Upload CSV
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center py-8">
                  Belum ada review tersimpan. Unggah CSV ulasan untuk memulai.
                </p>
              ) : (
                reviews.map((review) => {
                  const sentConfig =
                    sentimentMap[review.sentiment] || sentimentMap.neutral;

                  return (
                    <div
                      key={review.id}
                      className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      {/* Avatar placeholder */}
                      <div className="h-9 w-9 shrink-0 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        {review.customer.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">
                            {review.customer}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-[var(--border)]"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant={sentConfig.variant}>
                            {sentConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">
                          {review.text}
                        </p>
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                          {new Date(review.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sentimen Overview</CardTitle>
            <CardDescription>Distribusi sentimen ulasan pelanggan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sentiment Bars */}
              {[
                { label: "Positif", value: posPct, color: "var(--success)" },
                { label: "Netral", value: neuPct, color: "var(--warning)" },
                { label: "Negatif", value: negPct, color: "var(--danger)" },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[var(--muted)]">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Quick Insight */}
              <div className="mt-6 p-3 rounded-[var(--radius-md)] bg-[var(--primary)]/5 border border-[var(--primary)]/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Business Insight</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                  {aiInsight}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

