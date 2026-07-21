import { create } from "zustand";
import { fetchInventoryItems, fetchTransactions, fetchDashboardStats } from "./api";

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

interface AppState {
  inventory: InventoryItem[];
  transactions: Transaction[];
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  loadInventory: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  updateStock: (sku: string, newStock: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  inventory: [],
  transactions: [],
  dashboardStats: null,
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

