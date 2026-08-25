"use client";

import React, { useState, useEffect } from "react";
import { generateReviewReply } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  X,
  RefreshCw,
  Star,
  User,
  CheckCircle2,
} from "lucide-react";

interface ReviewReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    id: number;
    customer: string;
    rating: number;
    text: string;
    sentiment: "positive" | "neutral" | "negative";
  } | null;
  onRepliedSuccess?: (reviewId: number) => void;
}

export function ReviewReplyModal({
  isOpen,
  onClose,
  review,
  onRepliedSuccess,
}: ReviewReplyModalProps) {
  const { toast } = useToast();
  const [tone, setTone] = useState("friendly");
  const [suggestedReply, setSuggestedReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateReply = async () => {
    if (!review) return;
    setIsGenerating(true);
    try {
      const res = await generateReviewReply({
        customer_name: review.customer,
        rating: review.rating,
        review_text: review.text,
        sentiment: review.sentiment,
        tone,
      });
      setSuggestedReply(res.suggested_reply);
    } catch (err: any) {
      toast(err.message || "Gagal membuat balasan ulasan AI", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen && review) {
      handleGenerateReply();
    } else {
      setSuggestedReply("");
      setIsCopied(false);
    }
  }, [isOpen, review]);

  if (!isOpen || !review) return null;

  const handleCopy = () => {
    if (!suggestedReply) return;
    navigator.clipboard.writeText(suggestedReply);
    setIsCopied(true);
    toast("Balasan berhasil disalin ke clipboard!", "success");
    if (onRepliedSuccess) {
      onRepliedSuccess(review.id);
    }
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up text-sm">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Asisten Balasan Ulasan AI</h3>
              <p className="text-xs text-[var(--muted)]">Respon santun & profesional berbasis Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Customer Review Card Preview */}
        <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-hover)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold">
                {review.customer.substring(0, 1).toUpperCase()}
              </div>
              <span className="font-semibold text-xs">{review.customer}</span>
            </div>
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < review.rating ? "fill-amber-400" : "text-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-[var(--foreground)] italic">
            "{review.text}"
          </p>
        </div>

        {/* Tone Selector */}
        <Select
          label="Gaya Bahasa / Tone Balasan AI *"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          options={[
            { value: "friendly", label: "😊 Ramah, Hangat, & Apresiatif" },
            { value: "professional", label: "💼 Formal & Profesional Solutif" },
            { value: "apologetic", label: "🙏 Permohonan Maaf & Kompensasi CS" },
          ]}
        />

        {/* AI Suggested Response Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--muted)]">
              Rekomendasi Balasan AI:
            </span>
            <button
              onClick={handleGenerateReply}
              disabled={isGenerating}
              className="text-[var(--primary)] hover:underline flex items-center gap-1 font-medium"
            >
              <RefreshCw
                className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`}
              />
              Regenerasi Balasan
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={suggestedReply}
              onChange={(e) => setSuggestedReply(e.target.value)}
              placeholder="Memproses respon AI..."
              className="w-full p-3 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)] leading-relaxed resize-none"
            />
          </div>
        </div>

        <div className="p-2.5 rounded-[var(--radius-md)] bg-blue-950/40 border border-blue-800 text-blue-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Salin teks balasan dan tempel langsung pada platform Marketplace (Shopee/Tokopedia/WA).</span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="secondary"
            className="sm:w-1/3"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            type="button"
            variant="gradient"
            className="flex-1"
            onClick={handleCopy}
            disabled={!suggestedReply || isGenerating}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-1 text-emerald-400" /> Tersalin ke Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Salin Balasan (1-Click)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
