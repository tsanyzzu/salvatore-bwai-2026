"use client";

import React, { useState, useEffect } from "react";
import {
  fetchChannelStatus,
  toggleChannel,
  triggerChannelSync,
} from "@/lib/api";
import { ChannelSyncStatusResponse } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  RefreshCw,
  ShoppingBag,
  Store,
  Video,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  ArrowRightLeft,
} from "lucide-react";

export default function ChannelsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<ChannelSyncStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchChannelStatus();
      setData(res);
    } catch (err: any) {
      toast(err.message || "Gagal mengambil status channel e-commerce", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleChannel = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleChannel(id, !currentStatus);
      toast(res.message, "success");
      loadData();
    } catch (err: any) {
      toast(err.message || "Gagal mengubah koneksi channel", "error");
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerChannelSync("all");
      toast(res.message, "success");
      loadData();
    } catch (err: any) {
      toast(err.message || "Gagal melakukan sinkronisasi", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncChannel = async (channelId: string) => {
    setIsSyncing(true);
    try {
      const res = await triggerChannelSync(channelId);
      toast(res.message, "success");
      loadData();
    } catch (err: any) {
      toast(err.message || "Gagal melakukan sinkronisasi channel", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "shopee":
        return <ShoppingBag className="h-5 w-5 text-amber-500" />;
      case "tokopedia":
        return <Store className="h-5 w-5 text-emerald-500" />;
      case "tiktok_shop":
        return <Video className="h-5 w-5 text-rose-500" />;
      default:
        return <Globe className="h-5 w-5 text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Multi-Channel E-Commerce Sync
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Simulasi sinkronisasi harga & stok terpusat ke Marketplace (Shopee, Tokopedia, TikTok Shop) untuk mencegah overselling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            onClick={handleSyncAll}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Menyinkronkan..." : "Sinkronkan Semua Channel (1-Click)"}
          </Button>
        </div>
      </div>

      {/* ===== Section 1: Channel Connection Cards Grid ===== */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.channels.map((ch) => (
          <Card
            key={ch.id}
            className={`transition-all ${
              ch.is_connected
                ? "border-[var(--primary)]/40 bg-[var(--surface)]"
                : "opacity-60 bg-[var(--surface-hover)]/30 border-[var(--border)]"
            }`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-[var(--radius-md)] bg-[var(--surface-hover)] border border-[var(--border)]">
                    {getChannelIcon(ch.id)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{ch.name}</h4>
                    <p className="text-[10px] text-[var(--muted)]">
                      {ch.synced_product_count} produk terhubung
                    </p>
                  </div>
                </div>

                {/* Connection Toggle Switch */}
                <button
                  onClick={() => handleToggleChannel(ch.id, ch.is_connected)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    ch.is_connected ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
                  }`}
                  title={ch.is_connected ? "Nonaktifkan Channel" : "Aktifkan Channel"}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Status:</span>
                {ch.is_connected ? (
                  <Badge variant="success" className="py-0.5 px-2 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Terhubung
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="py-0.5 px-2 text-[10px]">
                    Nonaktif
                  </Badge>
                )}
              </div>

              <div className="text-[11px] text-[var(--muted)] flex items-center justify-between">
                <span>Update Terakhir:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {ch.last_synced_at || "-"}
                </span>
              </div>

              {ch.is_connected && (
                <button
                  onClick={() => handleSyncChannel(ch.id)}
                  disabled={isSyncing}
                  className="w-full mt-1 py-1.5 px-2 rounded-[var(--radius-md)] bg-[var(--surface-hover)] hover:bg-[var(--border)] border border-[var(--border)] text-xs text-[var(--foreground)] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 text-[var(--primary)]" /> Sync Channel Ini
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== Section 2: Product Channel Stock Matrix Table ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[var(--primary)]" />
              <div>
                <CardTitle className="text-base">
                  Matriks Stok Produk Terpusat
                </CardTitle>
                <CardDescription>
                  Status ketersediaan stok fisik di gudang lokal dan alokasi ke seluruh channel online
                </CardDescription>
              </div>
            </div>
            {data && (
              <Badge variant="secondary" className="py-1 px-3">
                <Zap className="h-3.5 w-3.5 mr-1 text-amber-400" />
                Terakhir Diperbarui: {data.last_global_sync}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-[var(--muted)] space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[var(--primary)]" />
              <p>Mengambil data matriks stok channel e-commerce...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-[var(--surface-hover)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-[var(--radius-md)]">SKU & Produk</th>
                    <th className="px-4 py-3">Harga Satuan</th>
                    <th className="px-4 py-3">Stok Gudang Lokal</th>
                    <th className="px-4 py-3">Shopee</th>
                    <th className="px-4 py-3">Tokopedia</th>
                    <th className="px-4 py-3">TikTok Shop</th>
                    <th className="px-4 py-3 rounded-r-[var(--radius-md)]">Status Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data?.matrix.map((row) => (
                    <tr key={row.sku} className="hover:bg-[var(--surface-hover)]/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold">{row.name}</p>
                        <p className="text-xs text-[var(--muted)] font-mono">{row.sku}</p>
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(row.price)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[var(--primary)]">
                        {row.local_stock} unit
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-amber-400">
                        {row.shopee_stock} unit
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-400">
                        {row.tokopedia_stock} unit
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-rose-400">
                        {row.tiktok_stock} unit
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={row.sync_status === "TERHUBUNG" ? "success" : "warning"}>
                          {row.sync_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
