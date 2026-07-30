import {
  InventoryItem,
  InventoryTransactionPayload,
  TransactionResponse,
  DashboardStats,
  ReviewItem,
  ReviewsSummary,
  CaptionRequest,
  CaptionResponse,
  TrendAnalysisRequest,
  CreativeGenerateRequest,
  CreativeResponse,
  ApiResponse,
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_URL}/api/inventory/items`);
  if (!res.ok) throw new Error("Gagal mengambil data inventori");
  return res.json();
}

export async function addTransaction(
  data: InventoryTransactionPayload
): Promise<{ status: string; message: string; new_stock: number }> {
  const res = await fetch(`${API_URL}/api/inventory/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal menambahkan transaksi");
  }
  return res.json();
}

export async function generateMarketingCaption(
  data: CaptionRequest
): Promise<CaptionResponse[]> {
  const res = await fetch(`${API_URL}/api/marketing/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal generate caption");
  }
  return res.json();
}

export async function uploadReviews(file: File): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/analytics/upload-reviews`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal mengunggah berkas ulasan");
  }
  return res.json();
}

export async function analyzeProductTrends(
  data: TrendAnalysisRequest
): Promise<{ status: string; analysis: string; message?: string }> {
  const res = await fetch(`${API_URL}/api/marketing/analyze-trends`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal menganalisis tren produk");
  }
  return res.json();
}

export async function generateCreativeContent(
  data: CreativeGenerateRequest
): Promise<CreativeResponse[]> {
  const res = await fetch(`${API_URL}/api/marketing/generate-creative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal generate creative content");
  }
  return res.json();
}

export async function simulateSocialPost(data: {
  platform: string;
  caption: string;
}): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/marketing/simulate-post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal mensimulasikan postingan");
  }
  return res.json();
}

export async function fetchTransactions(): Promise<TransactionResponse[]> {
  const res = await fetch(`${API_URL}/api/inventory/transactions`);
  if (!res.ok) throw new Error("Gagal mengambil data transaksi");
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/api/analytics/dashboard-stats`);
  if (!res.ok) throw new Error("Gagal mengambil statistik dashboard");
  return res.json();
}

export async function fetchReviews(): Promise<ReviewItem[]> {
  const res = await fetch(`${API_URL}/api/analytics/reviews`);
  if (!res.ok) throw new Error("Gagal mengambil daftar ulasan");
  return res.json();
}

export async function fetchReviewsSummary(): Promise<ReviewsSummary> {
  const res = await fetch(`${API_URL}/api/analytics/summary`);
  if (!res.ok) throw new Error("Gagal mengambil ringkasan ulasan");
  return res.json();
}
