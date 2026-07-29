"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Wand2,
  TrendingUp,
  Video,
  Check,
  Send,
  Share2,
} from "lucide-react";
import {
  generateMarketingCaption,
  analyzeProductTrends,
  generateCreativeContent,
  simulateSocialPost,
} from "@/lib/api";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"copywriter" | "trends" | "hooks">(
    "copywriter"
  );

  // Tab 1 State (AI Copywriter)
  const [isGenerating, setIsGenerating] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("engaging");
  const [captions, setCaptions] = useState<any[]>([]);

  // Tab 2 State (Trend Analysis)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trendProductName, setTrendProductName] = useState("");
  const [trendDescription, setTrendDescription] = useState("");
  const [trendAnalysisResult, setTrendAnalysisResult] = useState<string | null>(
    null
  );

  // Global Interactivity States
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateCaption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price || !description) return;

    setIsGenerating(true);
    try {
      const results = await generateMarketingCaption({
        product_name: productName,
        price: parseFloat(price),
        description,
        platform,
        tone,
      });
      setCaptions(results);
    } catch (err) {
      alert("Gagal generate caption. Pastikan backend berjalan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeTrends = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendProductName || !trendDescription) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeProductTrends({
        product_name: trendProductName,
        description: trendDescription,
      });
      if (res.status === "success") {
        setTrendAnalysisResult(res.analysis);
      } else {
        alert(res.message || "Gagal menganalisis tren");
      }
    } catch (err) {
      alert("Gagal menganalisis tren produk. Pastikan backend berjalan.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

      {/* ===== TAB 1: AI Copywriter ===== */}
      {activeTab === "copywriter" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Buat Caption Marketing</CardTitle>
                  <CardDescription>
                    Masukkan detail produk, AI akan generate caption promosi yang menarik
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateCaption} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Produk"
                    placeholder="e.g. Kopi Arabica Toraja 250g"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                  <Input
                    label="Harga"
                    placeholder="e.g. 85000"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <Textarea
                  label="Deskripsi Produk"
                  placeholder="Jelaskan keunggulan, bahan, atau fitur unik produk Anda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Platform"
                    placeholder="Pilih platform..."
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    options={[
                      { value: "instagram", label: "📸 Instagram" },
                      { value: "shopee", label: "🛍️ Shopee / Tokopedia" },
                      { value: "whatsapp", label: "💬 WhatsApp" },
                      { value: "all", label: "🌐 Semua Platform" },
                    ]}
                  />
                  <Select
                    label="Tone Bahasa"
                    placeholder="Pilih tone..."
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    options={[
                      { value: "engaging", label: "✨ Engaging" },
                      { value: "professional", label: "💼 Professional" },
                      { value: "friendly", label: "😊 Friendly" },
                      { value: "urgent", label: "🔥 Urgent / FOMO" },
                    ]}
                  />
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  disabled={isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Caption
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {captions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Hasil Caption Generate</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {captions.map((item, idx) => (
                  <Card key={idx} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                          <CardTitle className="text-sm">{item.platform}</CardTitle>
                        </div>
                        <Badge variant="secondary">{item.tone}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="rounded-[var(--radius-md)] bg-[var(--surface-hover)] p-3 text-sm whitespace-pre-line leading-relaxed text-[var(--foreground)]/90 max-h-48 overflow-y-auto font-sans">
                        {item.caption}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCopyText(`caption-${idx}`, item.caption)}
                      >
                        {copiedId === `caption-${idx}` ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 2: Analisis Tren Pasar ===== */}
      {activeTab === "trends" && (
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
      )}
    </div>
  );
}

