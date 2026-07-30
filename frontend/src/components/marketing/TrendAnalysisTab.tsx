"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Copy, RefreshCw, TrendingUp, Check } from "lucide-react";
import { analyzeProductTrends } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export function TrendAnalysisTab() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trendProductName, setTrendProductName] = useState("");
  const [trendDescription, setTrendDescription] = useState("");
  const [trendAnalysisResult, setTrendAnalysisResult] = useState<string | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast("Laporan analisis tren berhasil disalin!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnalyzeTrends = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendProductName || !trendDescription) {
      toast("Harap isi nama dan deskripsi produk", "info");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await analyzeProductTrends({
        product_name: trendProductName,
        description: trendDescription,
      });
      if (res.status === "success") {
        setTrendAnalysisResult(res.analysis);
        toast("Analisis tren berhasil diperbarui!", "success");
      } else {
        toast(res.message || "Gagal menganalisis tren", "error");
      }
    } catch (err: any) {
      toast(err.message || "Gagal menganalisis tren produk", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Analisis Tren Media Sosial</CardTitle>
              <CardDescription>
                Ketahui gaya konten video viral di TikTok, Instagram Reels, dan YouTube Shorts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyzeTrends} className="space-y-4">
            <Input
              label="Nama Produk"
              placeholder="e.g. Sambal Matah Organik / Tumbler Bambu"
              value={trendProductName}
              onChange={(e) => setTrendProductName(e.target.value)}
            />
            <Textarea
              label="Deskripsi Produk & Target Audiens"
              placeholder="Jelaskan jenis produk, rasa/fitur utama, dan target pasar Anda..."
              value={trendDescription}
              onChange={(e) => setTrendDescription(e.target.value)}
            />
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Menganalisis Tren...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analisis Tren Sekarang
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {trendAnalysisResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle>Rekomendasi Tren Konten AI</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyText("trends-result", trendAnalysisResult)}
              >
                {copiedId === "trends-result" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin Laporan
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-hover)] p-4 text-sm leading-relaxed whitespace-pre-line text-[var(--foreground)]">
              {trendAnalysisResult}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
