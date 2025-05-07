import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [], // Initialize with empty array

  // Set items directly (used when loading from server)
  setItems: (items) => {
    set({ items });
  },

  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );

      if (existingItem) {
        const updatedItems = state.items.map((i) =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
        return { items: updatedItems };
      }

      const newItems = [...state.items, item];
      return { items: newItems };
    }),

  removeItem: (id) =>
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      return { items: updatedItems };
    }),

  updateQuantity: (id, quantity) =>
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      return { items: updatedItems };
    }),

  clearCart: () => {
    set({ items: [] });
  },
}));