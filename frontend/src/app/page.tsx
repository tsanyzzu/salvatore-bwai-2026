"use client";

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
} from "lucide-react";

/* ===== Mock Data ===== */
const stats = [
  {
    label: "Total Revenue",
    value: "Rp 12.4M",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    label: "Orders",
    value: "284",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingCart,
  },
  {
    label: "Customers",
    value: "1,429",
    change: "+3.1%",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "Avg. Rating",
    value: "4.6",
    change: "-0.2",
    trend: "down" as const,
    icon: Star,
  },
];

const recentReviews = [
  {
    id: 1,
    customer: "Budi S.",
    rating: 5,
    text: "Produk sangat berkualitas, pengiriman cepat!",
    sentiment: "positive" as const,
    date: "2 jam lalu",
  },
  {
    id: 2,
    customer: "Ani R.",
    rating: 4,
    text: "Barangnya bagus tapi packaging bisa lebih baik.",
    sentiment: "neutral" as const,
    date: "5 jam lalu",
  },
  {
    id: 3,
    customer: "Dedi W.",
    rating: 2,
    text: "Pengiriman terlambat 3 hari, kecewa.",
    sentiment: "negative" as const,
    date: "1 hari lalu",
  },
  {
    id: 4,
    customer: "Siti N.",
    rating: 5,
    text: "Repeat order! Selalu puas sama kualitasnya.",
    sentiment: "positive" as const,
    date: "1 hari lalu",
  },
];

const sentimentMap = {
  positive: { label: "Positif", variant: "success" as const },
  neutral: { label: "Netral", variant: "warning" as const },
  negative: { label: "Negatif", variant: "danger" as const },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Ringkasan analitik penjualan & review toko Anda.
        </p>
      </div>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        {stats.map((stat) => (
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
              <Button variant="secondary" size="sm">
                Upload CSV
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  {/* Avatar placeholder */}
                  <div className="h-9 w-9 shrink-0 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {review.customer.charAt(0)}
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
                      <Badge variant={sentimentMap[review.sentiment].variant}>
                        {sentimentMap[review.sentiment].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">
                      {review.text}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      {review.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sentimen Overview</CardTitle>
            <CardDescription>Distribusi sentimen 30 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sentiment Bars */}
              {[
                { label: "Positif", value: 68, color: "var(--success)" },
                { label: "Netral", value: 22, color: "var(--warning)" },
                { label: "Negatif", value: 10, color: "var(--danger)" },
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
              <div className="mt-6 p-3 rounded-[var(--radius-md)] bg-[var(--success)]/5 border border-[var(--success)]/20">
                <p className="text-xs font-medium text-[var(--success)]">
                  📈 Insight
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Sentimen positif naik 5% dibanding bulan lalu. Pelanggan paling
                  puas dengan kualitas produk.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
