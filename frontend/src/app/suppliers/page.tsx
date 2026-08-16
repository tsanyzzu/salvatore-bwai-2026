"use client";

import React, { useState, useEffect } from "react";
import {
  fetchSuppliers,
  createSupplier,
  fetchRestockRecommendations,
} from "@/lib/api";
import { SupplierItem, RestokRecommendationItem } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search,
  MessageSquare,
  PackageCheck,
  CheckCircle2,
  X,
} from "lucide-react";

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [recommendations, setRecommendations] = useState<RestokRecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Kopi");
  const [address, setAddress] = useState("");
  const [leadTime, setLeadTime] = useState("3");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [supList, recList] = await Promise.all([
        fetchSuppliers(),
        fetchRestockRecommendations(),
      ]);
      setSuppliers(supList);
      setRecommendations(recList);
    } catch (err: any) {
      toast(err.message || "Gagal mengambil data supplier", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !phone || !category) {
      toast("Harap lengkapi semua bidang wajib!", "info");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupplier({
        name,
        contact_person: contactPerson,
        phone,
        email: email || undefined,
        category,
        address: address || undefined,
        lead_time_days: parseInt(leadTime, 10) || 3,
      });

      toast("Supplier baru berhasil ditambahkan!", "success");
      setIsModalOpen(false);
      setName("");
      setContactPerson("");
      setPhone("");
      setEmail("");
      setAddress("");
      loadData();
    } catch (err: any) {
      toast(err.message || "Gagal menambahkan supplier", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Restok Otomatis & Manajemen Pemasok
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Direktori supplier mitra & rekomendasi restok otomatis berbasis kalkulasi EOQ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" /> Tambah Supplier
          </Button>
        </div>
      </div>

      {/* ===== Section 1: Auto Restock Recommendation Engine ===== */}
      <Card className="border-[var(--primary)]/30 bg-gradient-to-br from-[var(--surface)] to-[var(--primary)]/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-[var(--radius-md)] gradient-primary flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Rekomendasi Restok Otomatis (EOQ Engine)
                </CardTitle>
                <CardDescription>
                  Daftar produk menyentuh stok kritis beserta estimasi jumlah pesanan ulang disarankan
                </CardDescription>
              </div>
            </div>
            <Badge variant="warning" className="py-1 px-3">
              {recommendations.length} Produk Perlu Restok
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {recommendations.length === 0 ? (
            <div className="py-6 text-center text-sm text-[var(--muted)] space-y-1">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-[var(--foreground)]">Stok Seluruh Barang Aman</p>
              <p className="text-xs">Tidak ada produk yang menyentuh batas minimum stok saat ini.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.sku}
                  className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--muted)] uppercase">
                        {rec.sku}
                      </span>
                      <h4 className="text-sm font-bold leading-snug">{rec.product_name}</h4>
                    </div>
                    <Badge variant={rec.urgency_level === "KRITIS" ? "danger" : "warning"}>
                      {rec.urgency_level}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-[var(--border)]">
                    <div>
                      <span className="text-[var(--muted)]">Stok Sekarang:</span>
                      <p className="font-bold text-rose-400">{rec.current_stock} unit</p>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Order Disarankan:</span>
                      <p className="font-bold text-emerald-400">{rec.recommended_reorder_qty} unit</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-[var(--muted)]">
                      Supplier: <span className="font-semibold text-[var(--foreground)]">{rec.suggested_supplier}</span>
                    </p>
                    <p className="text-[var(--muted)]">
                      Lead Time: <span className="font-semibold text-[var(--foreground)]">{rec.lead_time_days} hari</span>
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${rec.supplier_phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(rec.suggested_supplier)},%20kami%20ingin%20memesan%20restok%20${encodeURIComponent(rec.product_name)}%20sebanyak%20${rec.recommended_reorder_qty}%20unit.`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full mt-2 py-2 px-3 rounded-[var(--radius-md)] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Pesan Restok via WA
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Section 2: Suppliers Directory Table ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[var(--primary)]" />
              <div>
                <CardTitle className="text-base">Direktori Supplier Mitra</CardTitle>
                <CardDescription>
                  Daftar pemasok resmi untuk pengadaan stok barang UMKM
                </CardDescription>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Cari supplier / kontak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-[var(--surface-hover)] border border-[var(--border)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)]"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-[var(--muted)] space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[var(--primary)]" />
              <p>Memuat data direktori supplier...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-[var(--surface-hover)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-[var(--radius-md)]">Nama Supplier</th>
                    <th className="px-4 py-3">Kontak Person</th>
                    <th className="px-4 py-3">Kategori Produk</th>
                    <th className="px-4 py-3">No. Telepon / WA</th>
                    <th className="px-4 py-3">Lokasi Alamat</th>
                    <th className="px-4 py-3 rounded-r-[var(--radius-md)]">Lead Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--surface-hover)]/50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{s.name}</p>
                            <p className="text-xs text-[var(--muted)]">{s.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{s.contact_person}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="secondary">{s.category}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <a
                          href={`https://wa.me/${s.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-400 font-mono hover:underline text-xs"
                        >
                          <Phone className="h-3.5 w-3.5" /> {s.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-[var(--muted)] text-xs max-w-[200px] truncate">
                        {s.address || "-"}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-xs">
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Clock className="h-3.5 w-3.5" /> {s.lead_time_days} Hari
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== MODAL TAMBAH SUPPLIER ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up text-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="font-bold text-base">Tambah Supplier Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <Input
                label="Nama Perusahaan / Supplier *"
                placeholder="e.g. PT Kopi Nusantara"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Kontak Person *"
                  placeholder="e.g. Hendra"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
                <Input
                  label="No. Telepon / WA *"
                  placeholder="e.g. 0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Kategori Produk *"
                  placeholder="e.g. Kopi / Bahan / Makanan"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <Input
                  label="Lead Time (Hari)"
                  placeholder="e.g. 3"
                  type="number"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                />
              </div>
              <Input
                label="Email (Opsional)"
                placeholder="e.g. order@supplier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Alamat (Opsional)"
                placeholder="e.g. Bandung, Jawa Barat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Simpan..." : "Simpan Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
