import { create } from "zustand";
import {
  InventoryItem,
  TransactionResponse,
  DashboardStats,
  ReviewItem,
  ReviewsSummary,
} from "@/types/api";
import {
  fetchInventoryItems,
  fetchTransactions,
  fetchDashboardStats,
  fetchReviews,
  fetchReviewsSummary,
} from "./api";

interface AppState {
  inventory: InventoryItem[];
  transactions: TransactionResponse[];
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
    get().loadDashboardStats();
    get().loadTransactions();
  },
}));
