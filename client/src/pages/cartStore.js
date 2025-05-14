import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a cart store with persistence to localStorage
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Initialize with empty array

      // Set items directly (used when loading from server)
      setItems: (items) => {
        // Make sure we're not overwriting with an empty array if we already have items
        if (items && items.length > 0) {
          console.log('Setting cart items:', items.length);
          set({ items });
        } else if (get().items.length === 0) {
          // Only set empty array if we don't already have items
          set({ items: [] });
        }
      },

      addItem: (item) =>
        set((state) => {
          console.log('Adding item to cart:', item.name, 'Size:', item.size, 'Color:', item.color);

          // Create a unique key for this item based on id, size, and color
          const itemKey = `${item.id}-${item.size}-${item.color}`;

          // Check if this exact item already exists in the cart
          const existingItemIndex = state.items.findIndex(
            (i) => i.id === item.id && i.size === item.size && i.color === item.color
          );

          if (existingItemIndex !== -1) {
            // Item exists, update quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + item.quantity
            };

            console.log('Updated cart item quantity. New count:', updatedItems.length);
            return { items: updatedItems };
          }

          // Item doesn't exist, add it
          const newItems = [...state.items, { ...item, key: itemKey }];
          console.log('Added new cart item. New count:', newItems.length);
          return { items: newItems };
        }),

      removeItem: (id, size, color) =>
        set((state) => {
          console.log('Removing item from cart:', id, 'Size:', size, 'Color:', color);

          // If size and color are provided, remove only the specific item
          if (size && color) {
            const updatedItems = state.items.filter(
              (item) => !(item.id === id && item.size === size && item.color === color)
            );
            console.log('Removed specific item. New count:', updatedItems.length);
            return { items: updatedItems };
          }

          // Otherwise, remove all items with the given ID (for backward compatibility)
          const updatedItems = state.items.filter((item) => item.id !== id);
          console.log('Removed all items with ID. New count:', updatedItems.length);
          return { items: updatedItems };
        }),

      updateQuantity: (id, quantity, size, color) =>
        set((state) => {
          console.log('Updating quantity for item:', id, 'Size:', size, 'Color:', color, 'New quantity:', quantity);

          const updatedItems = state.items.map((item) => {
            // If size and color are provided, use them to identify the specific item
            if (size && color) {
              return (item.id === id && item.size === size && item.color === color)
                ? { ...item, quantity }
                : item;
            }
            // Otherwise, fall back to just using the ID (for backward compatibility)
            return item.id === id ? { ...item, quantity } : item;
          });

          return { items: updatedItems };
        }),

      clearCart: () => {
        console.log('Clearing cart');
        set({ items: [] });
      },
    }),
    {
      name: 'cart-storage', // unique name for localStorage
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
);