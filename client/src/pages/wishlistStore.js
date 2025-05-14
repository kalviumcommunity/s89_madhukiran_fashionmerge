import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a wishlist store with persistence to localStorage
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // Initialize with empty array

      setItems: (items) => {
        // Make sure we're not overwriting with an empty array if we already have items
        if (items && items.length > 0) {
          console.log('Setting wishlist items:', items.length);
          set({ items });
        } else if (get().items.length === 0) {
          // Only set empty array if we don't already have items
          set({ items: [] });
        }
      },

      addItem: (item) =>
        set((state) => {
          // Check if item already exists
          const exists = state.items.some((i) => i.id === item.id);
          if (!exists) {
            console.log('Adding item to wishlist:', item.name);
            const newItems = [...state.items, item];
            return { items: newItems };
          }
          return state;
        }),

      removeItem: (id) =>
        set((state) => {
          console.log('Removing item from wishlist:', id);
          const updatedItems = state.items.filter((item) => item.id !== id);
          return { items: updatedItems };
        }),

      clearWishlist: () => {
        console.log('Clearing wishlist');
        set({ items: [] });
      },
    }),
    {
      name: 'wishlist-storage', // unique name for localStorage
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
);