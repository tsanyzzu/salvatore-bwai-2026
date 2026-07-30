export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  price: number;
  category: string;
}

export interface InventoryTransactionPayload {
  sku: string;
  type: string;
  quantity: number;
  note?: string;
}

export interface TransactionResponse {
  id: number;
  sku: string;
  type: string;
  quantity: number;
  note: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  orders_count: number;
  products_count: number;
  inventory_value: number;
  avg_rating: number;
}

export interface ReviewItem {
  id: number;
  customer: string;
  rating: number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  created_at: string;
}

export interface ReviewsSummary {
  total_reviews: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  avg_rating: number;
  ai_insight: string;
}

export interface CaptionRequest {
  product_name: string;
  price: number;
  description: string;
  platform: string;
  tone: string;
}

export interface CaptionResponse {
  platform: string;
  caption: string;
  tone: string;
}

export interface TrendAnalysisRequest {
  product_name: string;
  description: string;
}

export interface CreativeGenerateRequest {
  product_name: string;
  price: number;
  description: string;
  platforms: string[];
  mode: "fully_ai" | "prompt";
  prompt?: string;
}

export interface CreativeResponse {
  platform: string;
  video_hook: string;
  caption: string;
  tone: string;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  [key: string]: any;
}
