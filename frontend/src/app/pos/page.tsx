"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/useStore";
import { checkoutPOS } from "@/lib/api";
import { InventoryItem, POSReceiptResponse } from "@/types/api";
import { useToast } from "@/components/ui/toast";
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
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function POSPage() {
  const { toast } = useToast();
  const { inventory, isLoading, loadInventory, loadDashboardStats } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Receipt Modal State
  const [receipt, setReceipt] = useState<POSReceiptResponse | null>(null);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Categories extraction
  const categories = [
    "all",
    ...Array.from(new Set(inventory.map((i) => i.category))),
  ];

  // Filtered Products
  const filteredProducts = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart Handlers
  const addToCart = (product: InventoryItem) => {
    if (product.stock <= 0) {
      toast(`Stok ${product.name} telah habis!`, "error");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.item.sku === product.sku);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast(`Stok maksimal tersisa: ${product.stock}`, "info");
          return prev;
        }
        return prev.map((c) =>
          c.item.sku === product.sku
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { item: product, quantity: 1 }];
    });
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.sku === sku) {
            const newQty = c.quantity + delta;
            if (newQty > c.item.stock) {
              toast(`Stok maksimal tersisa: ${c.item.stock}`, "info");
              return c;
            }
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => prev.filter((c) => c.item.sku !== sku));
  };

  const clearCart = () => {
    setCart([]);
    setAmountPaid("");
  };

  // Subtotal & Calculations
  const totalAmount = cart.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0
  );
  
  const numPaid = parseFloat(amountPaid) || 0;
  const changeAmount = numPaid - totalAmount;

  // Checkout Handler
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast("Keranjang belanja masih kosong!", "info");
      return;
    }

    if (paymentMethod === "cash" && numPaid < totalAmount) {
      toast("Uang pembayaran kurang dari total tagihan!", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await checkoutPOS({
        items: cart.map((c) => ({
          sku: c.item.sku,
          quantity: c.quantity,
        })),
        payment_method: paymentMethod,
        amount_paid: paymentMethod === "qris" ? totalAmount : numPaid,
      });

      setReceipt(res);
      toast("Transaksi Kasir Berhasil Diproses!", "success");
      loadInventory();
      loadDashboardStats();
    } catch (err: any) {
      toast(err.message || "Gagal memproses pembayaran kasir", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseReceipt = () => {
    setReceipt(null);
    clearCart();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kasir POS Cepat</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Pencatatan transaksi penjualan kasir *real-time* & potong stok otomatis.
          </p>
        </div>
        <Badge variant="success" className="self-start sm:self-auto py-1 px-3">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Ready POS System
        </Badge>
      </div>

      {/* ===== Main Grid Layout ===== */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Section: Catalog & Filter (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Cari produk atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)]"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium capitalize transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {cat === "all" ? "Semua" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((prod) => {
              const inCart = cart.find((c) => c.item.sku === prod.sku);
              const isOutOfStock = prod.stock <= 0;

              return (
                <Card
                  key={prod.sku}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                  } ${inCart ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""}`}
                >
                  <CardContent className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-bold text-[var(--muted)] uppercase">
                        {prod.sku}
                      </span>
                      <Badge
                        variant={
                          isOutOfStock
                            ? "danger"
                            : prod.stock <= prod.min_stock
                            ? "warning"
                            : "secondary"
                        }
                      >
                        Stok: {prod.stock}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                      {prod.name}
                    </h3>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-[var(--primary)]">
                        {formatCurrency(prod.price)}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="h-7 w-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Section: Shopping Cart & Checkout (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="sticky top-4">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[var(--primary)]" />
                  <CardTitle className="text-base">Keranjang Kasir</CardTitle>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-[var(--muted)] hover:text-rose-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Kosongkan
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Cart Items List */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--muted)] space-y-1">
                    <ShoppingCart className="h-8 w-8 mx-auto opacity-30" />
                    <p>Keranjang masih kosong</p>
                    <p className="text-xs">Klik produk di samping untuk menambahkan</p>
                  </div>
                ) : (
                  cart.map(({ item, quantity }) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-hover)] text-sm"
                    >
                      <div className="flex-1 pr-2 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {formatCurrency(item.price)} x {quantity} ={" "}
                          <span className="text-[var(--foreground)] font-semibold">
                            {formatCurrency(item.price * quantity)}
                          </span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.sku, -1)}
                          className="h-6 w-6 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--border)] text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, 1)}
                          className="h-6 w-6 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--border)] text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Total Barang:</span>
                  <span className="font-medium">
                    {cart.reduce((a, c) => a + c.quantity, 0)} item
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-[var(--foreground)]">
                  <span>Total Tagihan:</span>
                  <span className="text-[var(--primary)]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase text-[var(--muted)] tracking-wider">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-[var(--radius-md)] border text-xs font-medium transition-all ${
                      paymentMethod === "cash"
                        ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] font-bold"
                        : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    <Banknote className="h-4 w-4" /> Tunai (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-[var(--radius-md)] border text-xs font-medium transition-all ${
                      paymentMethod === "qris"
                        ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] font-bold"
                        : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    <QrCode className="h-4 w-4" /> QRIS / Cashless
                  </button>
                </div>
              </div>

              {/* Cash Paid Amount & Quick Buttons */}
              {paymentMethod === "cash" && (
                <div className="space-y-2">
                  <Input
                    label="Uang Dibayar (Rp)"
                    placeholder="e.g. 100000"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setAmountPaid(String(totalAmount))}
                      className="px-2.5 py-1 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Uang Pas
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaid("50000")}
                      className="px-2.5 py-1 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      50k
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaid("100000")}
                      className="px-2.5 py-1 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      100k
                    </button>
                  </div>

                  {/* Change Calculation */}
                  {numPaid > 0 && (
                    <div
                      className={`p-2.5 rounded-[var(--radius-md)] text-xs flex justify-between items-center ${
                        changeAmount >= 0
                          ? "bg-emerald-950/40 border border-emerald-800 text-emerald-300"
                          : "bg-rose-950/40 border border-rose-800 text-rose-300"
                      }`}
                    >
                      <span>{changeAmount >= 0 ? "Kembalian:" : "Kurang:"}</span>
                      <span className="font-bold text-sm">
                        {formatCurrency(Math.abs(changeAmount))}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isProcessing || cart.length === 0}
                onClick={handleCheckout}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" /> Proses Bayar & Cetak Struk
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* ===== DIGITAL RECEIPT MODAL ===== */}
      {receipt && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scale-up text-sm">
            {/* Header */}
            <div className="text-center space-y-1 border-b border-[var(--border)] pb-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-bold text-lg">MikroBoost Store</h2>
              <p className="text-xs text-[var(--muted)]">Struk Transaksi Penjualan</p>
              <p className="text-[11px] font-mono text-[var(--muted)]">{receipt.receipt_no}</p>
            </div>

            {/* Receipt Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {receipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div>
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-[var(--muted)]">
                      {it.quantity} x {formatCurrency(it.price)}
                    </p>
                  </div>
                  <span className="font-bold">{formatCurrency(it.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Receipt Totals */}
            <div className="pt-2 border-t border-[var(--border)] space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-sm">
                <span>Total:</span>
                <span className="text-[var(--primary)]">{formatCurrency(receipt.total_amount)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Metode:</span>
                <span className="uppercase font-semibold">{receipt.payment_method}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Dibayar:</span>
                <span>{formatCurrency(receipt.amount_paid)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-400">
                <span>Kembalian:</span>
                <span>{formatCurrency(receipt.change_amount)}</span>
              </div>
            </div>

            {/* Receipt Modal Footer Actions */}
            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-1" /> Cetak
              </Button>
              <Button
                variant="gradient"
                size="sm"
                className="flex-1"
                onClick={handleCloseReceipt}
              >
                Transaksi Baru
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
