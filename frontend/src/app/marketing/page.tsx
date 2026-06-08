"use client";

import React from "react";
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
  Camera,
  ShoppingBag,
  MessageCircle,
  Wand2,
} from "lucide-react";

/* Removed Mock Captions */

import { generateMarketingCaption } from "@/lib/api";

export default function MarketingPage() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState<number | null>(null);
  
  // Form State
  const [productName, setProductName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [platform, setPlatform] = React.useState("instagram");
  const [tone, setTone] = React.useState("engaging");
  
  // Results State
  const [captions, setCaptions] = React.useState<any[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price || !description) return;
    
    setIsGenerating(true);
    try {
      const results = await generateMarketingCaption({
        product_name: productName,
        price: parseFloat(price),
        description,
        platform,
        tone
      });
      setCaptions(results);
    } catch (err) {
      alert("Gagal generate caption. Pastikan backend berjalan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Copywriter</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Generate caption marketing otomatis untuk berbagai platform.
        </p>
      </div>

      {/* ===== Input Form ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Buat Caption</CardTitle>
              <CardDescription>
                Masukkan detail produk, AI akan generate caption untuk Anda
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
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
                label="Tone"
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

      {/* ===== Generated Results ===== */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Hasil Generate</h2>
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
                <div className="rounded-[var(--radius-md)] bg-[var(--surface-hover)] p-3 text-sm whitespace-pre-line leading-relaxed text-[var(--foreground)]/90 max-h-48 overflow-y-auto">
                  {item.caption}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCopy(idx, item.caption)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === idx ? "Copied!" : "Copy"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
