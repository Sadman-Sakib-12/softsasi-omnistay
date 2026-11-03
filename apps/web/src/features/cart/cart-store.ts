import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Unique cart item ID (e.g. vertical-type:resourceId:date)
  verticalType: "stay" | "tour" | "car" | "boat" | "space" | "event" | "flight";
  resourceId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  pricePerUnit: number;
  quantity: number;
  unitLabel: string; // "night", "person", "day", "hour", "seat"
  startDate?: string;
  endDate?: string;
  meta?: Record<string, any>;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item) => {
        const id =
          item.id ||
          `${item.verticalType}-${item.resourceId}-${item.startDate || "general"}`;
        const existing = get().items.find((i) => i.id === id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, id }] });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.pricePerUnit * item.quantity,
          0
        ),
      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "omnistay-cart-storage",
    }
  )
);

