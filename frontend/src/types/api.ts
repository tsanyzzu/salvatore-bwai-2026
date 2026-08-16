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

export interface POSCheckoutItem {
  sku: string;
  quantity: number;
}

export interface POSCheckoutPayload {
  items: POSCheckoutItem[];
  payment_method: "cash" | "qris";
  amount_paid: number;
  note?: string;
}

export interface POSReceiptItem {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface POSReceiptResponse {
  receipt_no: string;
  created_at: string;
  items: POSReceiptItem[];
  total_amount: number;
  payment_method: string;
  amount_paid: number;
  change_amount: number;
  status: string;
  message: string;
}

export interface ProductMarginItem {
  sku: string;
  name: string;
  price: number;
  estimated_cost: number;
  margin_amount: number;
  margin_pct: number;
  units_sold: number;
}

export interface MonthlyFinancialTrend {
  month: string;
  revenue: number;
  gross_profit: number;
  net_profit: number;
}

export interface FinancialSummary {
  total_revenue: number;
  total_cogs: number;
  gross_profit: number;
  operating_expenses: number;
  net_profit: number;
  profit_margin_pct: number;
  revenue_forecast_next_month: number;
  financial_health_status: string;
  ai_financial_insight: string;
  monthly_trends: MonthlyFinancialTrend[];
  product_margins: ProductMarginItem[];
}

export interface SupplierItem {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string | null;
  category: string;
  address: string | null;
  lead_time_days: number;
  created_at: string;
}

export interface SupplierCreatePayload {
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  category: string;
  address?: string;
  lead_time_days: number;
}

export interface RestokRecommendationItem {
  sku: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  category: string;
  recommended_reorder_qty: number;
  suggested_supplier: string;
  supplier_phone: string;
  lead_time_days: number;
  urgency_level: "KRITIS" | "PERLU_RESTOK";
}



