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
import { Sparkles, Copy, RefreshCw, Wand2, Check, Send } from "lucide-react";
import { generateMarketingCaption, simulateSocialPost } from "@/lib/api";
import { CaptionResponse } from "@/types/api";
import { useToast } from "@/components/ui/toast";

export function CopywriterTab() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("engaging");
  const [captions, setCaptions] = useState<CaptionResponse[]>([]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [simulatedPosts, setSimulatedPosts] = useState<string[]>([]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast("Caption berhasil disalin ke clipboard!", "success");
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
      setIsGenerating(false);
      setSimulatingId(null);
    }
  };

  const handleGenerateCaption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price || !description) {
      toast("Harap isi semua bidang formulir", "info");
      return;
    }

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
      toast("Caption berhasil dihasilkan!", "success");
    } catch (err: any) {
      toast(err.message || "Gagal generate caption", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    disabled={simulatingId === `sim-caption-${idx}`}
                    onClick={() => handleSimulatePost(`sim-caption-${idx}`, item.platform, item.caption)}
                  >
                    {simulatingId === `sim-caption-${idx}` ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : simulatedPosts.includes(`sim-caption-${idx}`) ? (
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
