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
import { Sparkles, Copy, RefreshCw, Video, Check, Send } from "lucide-react";
import { generateCreativeContent, simulateSocialPost } from "@/lib/api";
import { CreativeResponse } from "@/types/api";
import { useToast } from "@/components/ui/toast";

export function CreativeHooksTab() {
  const { toast } = useToast();
  const [isGeneratingCreative, setIsGeneratingCreative] = useState(false);
  const [creativeProductName, setCreativeProductName] = useState("");
  const [creativePrice, setCreativePrice] = useState("");
  const [creativeDescription, setCreativeDescription] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "TikTok",
    "Instagram",
  ]);
  const [creativeMode, setCreativeMode] = useState<"fully_ai" | "prompt">(
    "fully_ai"
  );
  const [creativePrompt, setCreativePrompt] = useState("");
  const [creativeResults, setCreativeResults] = useState<CreativeResponse[]>([]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [simulatedPosts, setSimulatedPosts] = useState<string[]>([]);

  const togglePlatform = (plat: string) => {
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast("Konsep storyboard berhasil disalin!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulatePost = async (id: string, platformName: string, captionText: string) => {
    setSimulatingId(id);
    try {
      const res = await simulateSocialPost({
        platform: platformName,
        caption: captionText,
      });
      if (res.status === "success") {
        setSimulatedPosts((prev) => [...prev, id]);
        toast(res.message || "Postingan berhasil disimulasikan!", "success");
      }
    } catch (err: any) {
      toast(err.message || "Gagal mensimulasikan postingan", "error");
    } finally {
      setSimulatingId(null);
    }
  };

  const handleGenerateCreativeHooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creativeProductName || !creativePrice || !creativeDescription) {
      toast("Harap isi nama, harga, dan deskripsi produk", "info");
      return;
    }

    setIsGeneratingCreative(true);
    try {
      const results = await generateCreativeContent({
        product_name: creativeProductName,
        price: parseFloat(creativePrice),
        description: creativeDescription,
        platforms: selectedPlatforms,
        mode: creativeMode,
        prompt: creativePrompt,
      });
      setCreativeResults(results);
      toast("Creative Video Hooks berhasil dibuat!", "success");
    } catch (err: any) {
      toast(err.message || "Gagal generate creative hooks", "error");
    } finally {
      setIsGeneratingCreative(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Generator Storyboard Video Pendek</CardTitle>
              <CardDescription>
                Hasilkan konsep visual video 15 detik (Hook visual, audio, teks layar) & takarir sosial media
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateCreativeHooks} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Nama Produk"
                placeholder="e.g. Kopi Arabica Toraja 250g"
                value={creativeProductName}
                onChange={(e) => setCreativeProductName(e.target.value)}
              />
              <Input
                label="Harga"
                placeholder="e.g. 85000"
                type="number"
                value={creativePrice}
                onChange={(e) => setCreativePrice(e.target.value)}
              />
            </div>
            <Textarea
              label="Deskripsi & Nilai Tambah Produk"
              placeholder="Jelaskan mengapa produk ini unik atau layak dibeli pelanggan..."
              value={creativeDescription}
              onChange={(e) => setCreativeDescription(e.target.value)}
            />

            <div>
              <label className="block text-[13px] font-medium text-[var(--foreground)] mb-2">
                Target Platform Media Sosial
              </label>
              <div className="flex flex-wrap gap-2">
                {["TikTok", "Instagram", "YouTube"].map((plat) => {
                  const isSel = selectedPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => togglePlatform(plat)}
                      className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold border transition-all ${
                        isSel
                          ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      {plat === "TikTok" ? "🎵 TikTok" : plat === "Instagram" ? "📸 Instagram Reels" : "📺 YouTube Shorts"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Mode Kampanye"
                placeholder="Pilih mode kampanye..."
                value={creativeMode}
                onChange={(e) => setCreativeMode(e.target.value as any)}
                options={[
                  { value: "fully_ai", label: "🤖 Fully AI (Otomatis Kreatif)" },
                  { value: "prompt", label: "✍️ Custom Prompt (Instruksi Khusus)" },
                ]}
              />
              {creativeMode === "prompt" && (
                <Input
                  label="Instruksi Khusus"
                  placeholder="e.g. Tema ASMR / Komedi POV / Aesthetic"
                  value={creativePrompt}
                  onChange={(e) => setCreativePrompt(e.target.value)}
                />
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={isGeneratingCreative}
              className="w-full sm:w-auto"
            >
              {isGeneratingCreative ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Storyboard...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Video Hooks
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {creativeResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Hasil Concept & Visual Hooks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {creativeResults.map((item, idx) => (
              <Card key={idx} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-[var(--primary)]" />
                      <CardTitle className="text-sm">{item.platform}</CardTitle>
                    </div>
                    <Badge variant="secondary">{item.tone}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
                      🎬 Visual Video Hook (15 Detik)
                    </p>
                    <div className="rounded-[var(--radius-md)] bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-3 text-xs leading-relaxed text-[var(--foreground)]">
                      {item.video_hook}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                      📝 Takarir / Caption Promosi
                    </p>
                    <div className="rounded-[var(--radius-md)] bg-[var(--surface-hover)] p-3 text-xs whitespace-pre-line leading-relaxed text-[var(--foreground)]/90 max-h-36 overflow-y-auto">
                      {item.caption}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopyText(`hook-${idx}`, `${item.video_hook}\n\n${item.caption}`)}
                  >
                    {copiedId === `hook-${idx}` ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Salin Konsep
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    disabled={simulatingId === `sim-hook-${idx}`}
                    onClick={() => handleSimulatePost(`sim-hook-${idx}`, item.platform, item.caption)}
                  >
                    {simulatingId === `sim-hook-${idx}` ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : simulatedPosts.includes(`sim-hook-${idx}`) ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Tersimulasi
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Simulasi Post
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
  );
}
