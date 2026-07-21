// api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchInventoryItems() {
  const res = await fetch(`${API_URL}/api/inventory/items`);
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

export async function addTransaction(data: { sku: string; type: string; quantity: number }) {
  const res = await fetch(`${API_URL}/api/inventory/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add transaction");
  return res.json();
}

export async function generateMarketingCaption(data: any) {
  const res = await fetch(`${API_URL}/api/marketing/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to generate caption");
  return res.json();
}

export async function uploadReviews(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_URL}/api/analytics/upload-reviews`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload reviews");
  return res.json();
}

export async function analyzeProductTrends(data: { product_name: string; description: string }) {
  const res = await fetch(`${API_URL}/api/marketing/analyze-trends`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to analyze product trends");
  return res.json();
}

export async function generateCreativeContent(data: {
  product_name: string;
  price: number;
  description: string;
  platforms: string[];
  mode: string;
  prompt?: string;
}) {
  const res = await fetch(`${API_URL}/api/marketing/generate-creative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to generate creative content");
  return res.json();
}

export async function simulateSocialPost(data: { platform: string; caption: string }) {
  const res = await fetch(`${API_URL}/api/marketing/simulate-post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to simulate post");
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch(`${API_URL}/api/inventory/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_URL}/api/analytics/dashboard-stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}


