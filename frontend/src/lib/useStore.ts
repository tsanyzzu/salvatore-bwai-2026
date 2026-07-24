import { create } from "zustand";
import { fetchInventoryItems, fetchTransactions, fetchDashboardStats, fetchReviews, fetchReviewsSummary } from "./api";

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  price: number;
  category: string;
}

interface Transaction {
  id: number;
  sku: string;
  type: string;
  quantity: number;
  note: string | null;
  created_at: string;
}

interface DashboardStats {
  total_revenue: number;
  orders_count: number;
  products_count: number;
  inventory_value: number;
  avg_rating: number;
}

interface ReviewItem {
  id: number;
  customer: string;
  rating: number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  created_at: string;
}

interface ReviewsSummary {
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

interface AppState {
  inventory: InventoryItem[];
  transactions: Transaction[];
  dashboardStats: DashboardStats | null;
  reviews: ReviewItem[];
  reviewsSummary: ReviewsSummary | null;
  isLoading: boolean;
  error: string | null;
  loadInventory: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadReviews: () => Promise<void>;
  loadReviewsSummary: () => Promise<void>;
  updateStock: (sku: string, newStock: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  inventory: [],
  transactions: [],
  dashboardStats: null,
  reviews: [],
  reviewsSummary: null,
  isLoading: false,
  error: null,
  loadInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchInventoryItems();
      set({ inventory: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  loadTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchTransactions();
      set({ transactions: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  loadDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchDashboardStats();
      set({ dashboardStats: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  loadReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchReviews();
      set({ reviews: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  loadReviewsSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchReviewsSummary();
      set({ reviewsSummary: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  updateStock: (sku, newStock) => {
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.sku === sku ? { ...item, stock: newStock } : item
      ),
    }));
    // Proactively refresh dashboard stats and transactions if stock changes
    get().loadDashboardStats();
    get().loadTransactions();
  },
}));


