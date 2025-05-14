import { create } from 'zustand';
import { BASE_URL } from '../config/api';

// Create a cart store that uses MongoDB as the source of truth
export const useCartStore = create((set, get) => ({
  items: [], // Initialize with empty array
  isLoading: false,
  error: null,

  // Set items directly (used when loading from server)
  setItems: (items) => {
    if (items && items.length > 0) {
      console.log('Setting cart items:', items.length);
      set({ items });
    } else {
      console.log('Setting empty cart');
      set({ items: [] });
    }
  },

  // Fetch cart items from MongoDB
  fetchItems: async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      console.log('User not logged in, cannot fetch cart items');
      set({ items: [], error: null });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      console.log('Fetching cart items for user:', userId);

      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to fetch cart items: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Server response for cart items:', result);

      // Update cart items with fetched data if available
      if (result.data && result.data.cartItems && result.data.cartItems.length > 0) {
        console.log('Fetched cart items from server:', result.data.cartItems);
        set({ items: result.data.cartItems, isLoading: false });
      } else {
        console.log('No cart items found on server');
        set({ items: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Save cart items to MongoDB
  saveItems: async (items) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      console.log('User not logged in, cannot save cart items');
      return false;
    }

    try {
      console.log('Saving cart items to server for user:', userId);
      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItems: items }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to save cart items: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Cart items saved successfully:', result);
      return true;
    } catch (error) {
      console.error('Error saving cart items:', error);
      set({ error: error.message });
      return false;
    }
  },

  addItem: async (item) => {
    console.log('Adding item to cart:', item.name, 'Size:', item.size, 'Color:', item.color);

    // Create a unique key for this item based on id, size, and color
    const itemKey = `${item.id}-${item.size}-${item.color}`;

    // Get current items
    const currentItems = get().items;

    // Check if this exact item already exists in the cart
    const existingItemIndex = currentItems.findIndex(
      (i) => i.id === item.id && i.size === item.size && i.color === item.color
    );

    let updatedItems;

    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity
      };
      console.log('Updated cart item quantity. New count:', updatedItems.length);
    } else {
      // Item doesn't exist, add it
      updatedItems = [...currentItems, { ...item, key: itemKey }];
      console.log('Added new cart item. New count:', updatedItems.length);
    }

    // Update local state immediately for responsive UI
    set({ items: updatedItems });

    // Save to MongoDB
    const success = await get().saveItems(updatedItems);

    // If save failed, revert local state
    if (!success) {
      console.error('Failed to save cart items to MongoDB, reverting local state');
      set({ items: currentItems });
    }
  },

  removeItem: async (id, size, color) => {
    console.log('Removing item from cart:', id, 'Size:', size, 'Color:', color);

    // Get current items
    const currentItems = get().items;
    let updatedItems;

    // If size and color are provided, remove only the specific item
    if (size && color) {
      updatedItems = currentItems.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      );
      console.log('Removed specific item. New count:', updatedItems.length);
    } else {
      // Otherwise, remove all items with the given ID (for backward compatibility)
      updatedItems = currentItems.filter((item) => item.id !== id);
      console.log('Removed all items with ID. New count:', updatedItems.length);
    }

    // Update local state immediately for responsive UI
    set({ items: updatedItems });

    // Save to MongoDB
    const success = await get().saveItems(updatedItems);

    // If save failed, revert local state
    if (!success) {
      console.error('Failed to save cart items to MongoDB, reverting local state');
      set({ items: currentItems });
    }
  },

  updateQuantity: async (id, quantity, size, color) => {
    console.log('Updating quantity for item:', id, 'Size:', size, 'Color:', color, 'New quantity:', quantity);

    // Get current items
    const currentItems = get().items;

    const updatedItems = currentItems.map((item) => {
      // If size and color are provided, use them to identify the specific item
      if (size && color) {
        return (item.id === id && item.size === size && item.color === color)
          ? { ...item, quantity }
          : item;
      }
      // Otherwise, fall back to just using the ID (for backward compatibility)
      return item.id === id ? { ...item, quantity } : item;
    });

    // Update local state immediately for responsive UI
    set({ items: updatedItems });

    // Save to MongoDB
    const success = await get().saveItems(updatedItems);

    // If save failed, revert local state
    if (!success) {
      console.error('Failed to save cart items to MongoDB, reverting local state');
      set({ items: currentItems });
    }
  },

  clearCart: async () => {
    console.log('Clearing cart');

    // Get current items for potential rollback
    const currentItems = get().items;

    // Update local state immediately
    set({ items: [] });

    // Save to MongoDB
    const success = await get().saveItems([]);

    // If save failed, revert local state
    if (!success) {
      console.error('Failed to clear cart in MongoDB, reverting local state');
      set({ items: currentItems });
    }
  },
}));