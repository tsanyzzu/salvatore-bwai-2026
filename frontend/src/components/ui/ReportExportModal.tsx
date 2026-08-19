"use client";

import React, { useState } from "react";
import { exportReport } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  FileText,
  FileSpreadsheet,
  Download,
  X,
  RefreshCw,
  CheckCircle2,
  Building2,
} from "lucide-react";

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReportType?: "financial" | "inventory" | "reviews";
}

export function ReportExportModal({
  isOpen,
  onClose,
  defaultReportType = "financial",
}: ReportExportModalProps) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<"financial" | "inventory" | "reviews">(
    defaultReportType
  );
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [timeframe, setTimeframe] = useState("30_days");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const res = await exportReport({
        report_type: reportType,
        format,
        timeframe,
      });

      if (res.status === "success" && res.file_content_base64) {
        // Trigger file download in browser
        const byteCharacters = atob(res.file_content_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: res.content_type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = res.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast(res.message || "Berkas laporan resmi berhasil diunduh!", "success");
        onClose();
      } else {
        toast("Gagal mengunduh berkas laporan", "error");
      }
    } catch (err: any) {
      toast(err.message || "Terjadi kesalahan saat mengunduh laporan", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up text-sm">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Pusat Ekspor Laporan Resmi</h3>
              <p className="text-xs text-[var(--muted)]">Siap cetak untuk lampiran KUR / Bank</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleExport} className="space-y-4">
          <Select
            label="Jenis Laporan Resmi *"
            placeholder="Pilih jenis laporan..."
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            options={[
              { value: "financial", label: "💰 Laporan Keuangan & Laba/Rugi" },
              { value: "inventory", label: "📦 Laporan Stok & Valuasi Inventori" },
              { value: "reviews", label: "⭐ Laporan Sentimen Kepuasan Pelanggan" },
            ]}
          />

          <div>
            <label className="block text-[13px] font-medium text-[var(--foreground)] mb-2">
              Format Berkas Unduhan *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border text-xs font-semibold gap-1.5 transition-all ${
                  format === "pdf"
                    ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]"
                }`}
              >
                <FileText className="h-5 w-5 text-rose-400" /> PDF Official
              </button>
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border text-xs font-semibold gap-1.5 transition-all ${
                  format === "excel"
                    ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]"
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" /> Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border text-xs font-semibold gap-1.5 transition-all ${
                  format === "csv"
                    ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]"
                }`}
              >
                <Download className="h-5 w-5 text-cyan-400" /> Data CSV
              </button>
            </div>
          </div>

          <Select
            label="Rentang Waktu Data *"
            placeholder="Pilih rentang..."
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={[
              { value: "30_days", label: "📅 30 Hari Terakhir (Bulan Ini)" },
              { value: "90_days", label: "📅 90 Hari Terakhir (Kuartal Ini)" },
              { value: "all", label: "🌐 Seluruh Data Historis Usaha" },
            ]}
          />

          <div className="p-3 rounded-[var(--radius-md)] bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Format berkas ini memenuhi standar verifikasi pengajuan kredit KUR UMKM.</span>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" /> Mengunduh...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" /> Unduh Laporan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
