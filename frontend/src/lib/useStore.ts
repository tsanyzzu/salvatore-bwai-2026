import { create } from "zustand";
import { fetchInventoryItems } from "./api";

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  price: number;
  category: string;
}

interface AppState {
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  loadInventory: () => Promise<void>;
  updateStock: (sku: string, newStock: number) => void;
}

export const useStore = create<AppState>((set) => ({
  inventory: [],
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
  updateStock: (sku, newStock) =>
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.sku === sku ? { ...item, stock: newStock } : item
      ),
    })),
}));
