"use client";

import React, { useState, useEffect } from "react";
import { fetchFinancialSummary } from "@/lib/api";
import { FinancialSummary } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Award,
  BarChart3,
  Layers,
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function FinancialsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"this_month" | "last_3_months" | "this_year">("this_month");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const summary = await fetchFinancialSummary();
      setData(summary);
      toast("Data analitik keuangan berhasil diperbarui", "info");
    } catch (err: any) {
      toast(err.message || "Gagal mengambil data keuangan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm text-[var(--muted)]">Mengalkulasi neraca keuangan UMKM...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analitik Keuangan & Laba/Rugi
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Perhitungan kesehatan finansial, margin keuntungan produk, & proyeksi omzet berbasis AI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--surface-hover)] p-1 rounded-[var(--radius-md)] border border-[var(--border)] text-xs">
            <button
              onClick={() => setTimeframe("this_month")}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === "this_month"
                  ? "bg-[var(--primary)] text-white font-bold"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setTimeframe("last_3_months")}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === "last_3_months"
                  ? "bg-[var(--primary)] text-white font-bold"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              3 Bulan
            </button>
            <button
              onClick={() => setTimeframe("this_year")}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === "this_year"
                  ? "bg-[var(--primary)] text-white font-bold"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Tahun Ini
            </button>
          </div>
          <Badge variant="success" className="py-1.5 px-3">
            <Award className="h-3.5 w-3.5 mr-1" /> {data.financial_health_status}
          </Badge>
          <button
            onClick={loadData}
            className="p-2 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ===== Top KPI Grid (4 Cards) ===== */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="hover:border-[var(--primary)]/50 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Total Omzet Penjualan
              </span>
              <div className="h-8 w-8 rounded-[var(--radius-md)] bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrency(data.total_revenue)}
            </p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> +15.2% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        {/* Net Profit & Margin % */}
        <Card className="hover:border-[var(--primary)]/50 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Laba Bersih (Net Profit)
              </span>
              <div className="h-8 w-8 rounded-[var(--radius-md)] bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-emerald-400">
              {formatCurrency(data.net_profit)}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Margin Bersih:{" "}
              <span className="font-bold text-[var(--foreground)]">
                {data.profit_margin_pct}%
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Gross Profit & COGS */}
        <Card className="hover:border-[var(--primary)]/50 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Laba Kotor (Gross Profit)
              </span>
              <div className="h-8 w-8 rounded-[var(--radius-md)] bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <PieChart className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrency(data.gross_profit)}
            </p>
            <p className="text-xs text-[var(--muted)]">
              HPP (COGS): {formatCurrency(data.total_cogs)}
            </p>
          </CardContent>
        </Card>

        {/* AI Revenue Forecast */}
        <Card className="hover:border-[var(--primary)]/50 transition-all bg-gradient-to-br from-[var(--surface)] to-[var(--primary)]/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-wider font-bold">
                Proyeksi Omzet Bulan Depan
              </span>
              <div className="h-8 w-8 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-[var(--primary)]">
              {formatCurrency(data.revenue_forecast_next_month)}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Est. Pertumbuhan: <span className="text-emerald-400 font-bold">+15%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===== AI Financial Insight & Monthly Trend ===== */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* AI Financial Insight (5 Cols) */}
        <Card className="md:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-base">Wawasan Keuangan AI</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-hover)] border border-[var(--border)] p-4 text-sm leading-relaxed text-[var(--foreground)]">
              {data.ai_financial_insight}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Visual (7 Cols) */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
              <div>
                <CardTitle className="text-base">Tren Keuangan Bulanan</CardTitle>
                <CardDescription>
                  Perbandingan Omzet, Laba Kotor, dan Laba Bersih
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.monthly_trends.map((item, idx) => {
              const maxRev = Math.max(...data.monthly_trends.map((t) => t.revenue));
              const revPct = Math.round((item.revenue / maxRev) * 100);
              const profitPct = Math.round((item.net_profit / maxRev) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{item.month}</span>
                    <span className="text-[var(--primary)]">
                      Omzet: {formatCurrency(item.revenue)} | Laba Bersih:{" "}
                      <span className="text-emerald-400">
                        {formatCurrency(item.net_profit)}
                      </span>
                    </span>
                  </div>
                  {/* Progress Bar Stack */}
                  <div className="h-3 w-full bg-[var(--surface-hover)] rounded-full overflow-hidden flex gap-0.5">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                      style={{ width: `${revPct}%` }}
                    />
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500 opacity-80"
                      style={{ width: `${profitPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ===== Product Profit Margin Breakdown Table ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--primary)]" />
            <div>
              <CardTitle className="text-base">Rincian Margin Keuntungan per Produk</CardTitle>
              <CardDescription>
                Analisis kontribusi profitabilitas dan HPP (Harga Pokok Penjualan) per SKU
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-[var(--surface-hover)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 rounded-l-[var(--radius-md)]">SKU / Produk</th>
                  <th className="px-4 py-3">Harga Jual</th>
                  <th className="px-4 py-3">Est. HPP (Cost)</th>
                  <th className="px-4 py-3">Margin (Rp)</th>
                  <th className="px-4 py-3">Margin (%)</th>
                  <th className="px-4 py-3 rounded-r-[var(--radius-md)]">Terjual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.product_margins.map((prod) => (
                  <tr key={prod.sku} className="hover:bg-[var(--surface-hover)]/50 transition-colors">
                    <td className="px-4 py-3.5 font-medium">
                      <p className="font-semibold">{prod.name}</p>
                      <p className="text-xs text-[var(--muted)] font-mono">{prod.sku}</p>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--foreground)]">
                      {formatCurrency(prod.price)}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--muted)]">
                      {formatCurrency(prod.estimated_cost)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-400">
                      {formatCurrency(prod.margin_amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={prod.margin_pct >= 40 ? "success" : "secondary"}>
                        {prod.margin_pct}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">
                      {prod.units_sold} unit
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
