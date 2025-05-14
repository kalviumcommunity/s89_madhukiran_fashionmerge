import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  items: [], // Initialize with empty array

  setItems: (items) => {
    set({ items });
  },

  addItem: (item) =>
    set((state) => {
      const exists = state.items.some((i) => i.id === item.id);
      if (!exists) {
        const newItems = [...state.items, item];
        return { items: newItems };
      }
      return state;
    }),

  removeItem: (id) =>
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      return { items: updatedItems };
    }),

  clearWishlist: () => {
    set({ items: [] });
  },
}));