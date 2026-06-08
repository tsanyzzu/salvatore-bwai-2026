"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  Package,
  Plus,
  Minus,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useStore } from "@/lib/useStore";
import { addTransaction } from "@/lib/api";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function InventoryPage() {
  const { inventory, isLoading, loadInventory, updateStock } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [sku, setSku] = useState("");
  const [type, setType] = useState("");
  const [qty, setQty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !type || !qty) return;
    
    setIsSubmitting(true);
    try {
      const res = await addTransaction({
        sku,
        type,
        quantity: parseInt(qty, 10),
      });
      if (res.status === "success") {
        updateStock(sku, res.new_stock);
        setSku("");
        setType("");
        setQty("");
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Gagal menambahkan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = inventory.filter(
    (i) => i.stock <= i.min_stock
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inventory Manager
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Kelola stok & cashflow barang Anda.
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      {/* ===== Quick Stats ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">
              Total Produk
            </p>
            <p className="text-2xl font-bold mt-1">
              {inventory.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">
              Total Stok
            </p>
            <p className="text-2xl font-bold mt-1">
              {inventory.reduce((sum, i) => sum + i.stock, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">
              Nilai Inventori
            </p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(
                inventory.reduce(
                  (sum, i) => sum + i.stock * i.price,
                  0
                )
              )}
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            lowStockCount > 0
              ? "border-[var(--warning)]/40 bg-[var(--warning)]/5"
              : ""
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5">
              {lowStockCount > 0 && (
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)]" />
              )}
              <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">
                Stok Rendah
              </p>
            </div>
            <p className="text-2xl font-bold mt-1">{lowStockCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== Add Transaction Form ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Catat Transaksi Baru</CardTitle>
          <CardDescription>
            Input transaksi masuk/keluar stok barang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransaction} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Produk"
              placeholder="Pilih produk..."
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              options={inventory.map((i) => ({
                value: i.sku,
                label: i.name,
              }))}
            />
            <Select
              label="Tipe"
              placeholder="Pilih tipe..."
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: "in", label: "📥 Barang Masuk" },
                { value: "out", label: "📤 Barang Keluar" },
              ]}
            />
            <Input label="Jumlah" type="number" placeholder="0" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ===== Inventory Table ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Daftar Inventori</CardTitle>
              <CardDescription>
                {filteredItems.length} produk ditemukan
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Cari produk atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]/50">
                  <th className="text-left py-3 px-5 font-medium text-[var(--muted)]">
                    Produk
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-[var(--muted)] hidden sm:table-cell">
                    SKU
                  </th>
                  <th className="text-right py-3 px-5 font-medium text-[var(--muted)]">
                    Stok
                  </th>
                  <th className="text-right py-3 px-5 font-medium text-[var(--muted)] hidden md:table-cell">
                    Harga
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-[var(--muted)] hidden lg:table-cell">
                    Transaksi Terakhir
                  </th>
                  <th className="text-center py-3 px-5 font-medium text-[var(--muted)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isLowStock = item.stock <= item.min_stock;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-[var(--radius-md)] bg-[var(--primary)]/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-[var(--primary)]" />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">
                              {item.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[var(--muted)] hidden sm:table-cell font-mono text-xs">
                        {item.sku}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="font-semibold">{item.stock}</span>
                        {isLowStock && (
                          <Badge variant="warning" className="ml-2">
                            Low
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right text-[var(--muted)] hidden md:table-cell">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-5 hidden lg:table-cell">
                        <span className="text-xs text-[var(--muted)]">
                          —
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
