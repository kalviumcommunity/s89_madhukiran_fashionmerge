import { create } from 'zustand';
import { BASE_URL } from '../config/api';

// Create a wishlist store that uses MongoDB as the source of truth
export const useWishlistStore = create((set, get) => ({
  items: [], // Initialize with empty array
  isLoading: false,
  error: null,

  // Set items directly (used when loading from server)
  setItems: (items) => {
    if (items && items.length > 0) {
      console.log('Setting wishlist items:', items.length);
      set({ items });
    } else {
      console.log('Setting empty wishlist');
      set({ items: [] });
    }
  },

  // Fetch wishlist items from MongoDB
  fetchItems: async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      console.log('User not logged in, cannot fetch wishlist items');
      set({ items: [], error: null });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      console.log('Fetching wishlist items for user:', userId);

      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to fetch wishlist items: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Server response for wishlist items:', result);

      // Update wishlist items with fetched data if available
      if (result.data && result.data.wishlistItems && result.data.wishlistItems.length > 0) {
        console.log('Fetched wishlist items from server:', result.data.wishlistItems);
        set({ items: result.data.wishlistItems, isLoading: false });
      } else {
        console.log('No wishlist items found on server');
        set({ items: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Save wishlist items to MongoDB
  saveItems: async (items) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      console.log('User not logged in, cannot save wishlist items');
      return false;
    }

    try {
      console.log('Saving wishlist items to server for user:', userId);
      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wishlistItems: items }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to save wishlist items: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Wishlist items saved successfully:', result);
      return true;
    } catch (error) {
      console.error('Error saving wishlist items:', error);
      set({ error: error.message });
      return false;
    }
  },

  addItem: async (item) => {
    console.log('Adding item to wishlist:', item.name);

    // Get current items
    const currentItems = get().items;

    // Check if item already exists
    const exists = currentItems.some((i) => i.id === item.id);
    if (exists) {
      console.log('Item already exists in wishlist');
      return;
    }

    // Add the item
    const updatedItems = [...currentItems, item];

    // Update local state immediately for responsive UI
    set({ items: updatedItems });

    // Save to MongoDB
    const success = await get().saveItems(updatedItems);

    // If save failed, revert local state
    if (!success) {
      console.error('Failed to save wishlist items to MongoDB, reverting local state');
      set({ items: currentItems });
    }
  },

  removeItem: async (id) => {
    console.log('Removing item from wishlist:', id);

    // Get current items
    const currentItems = get().items;

    // Remove the item
    const updatedItems = currentItems.filter((item) => item.id !== id);

    // Update local state immediately for responsive UI
    set({ items: updatedItems });

    // Save to MongoDB
    const success = await get().saveItems(updatedItems);

    // If save failed, revert local state
    if (!success) {
      console.error('Failed to save wishlist items to MongoDB, reverting local state');
      set({ items: currentItems });
    }
  },

  clearWishlist: async () => {
    console.log('Clearing wishlist');

    // Get current items for potential rollback
    const currentItems = get().items;

    // Update local state immediately
    set({ items: [] });

    // Save to MongoDB
    const success = await get().saveItems([]);

    // If save failed, revert local state
    if (!success) {
      console.error('Failed to clear wishlist in MongoDB, reverting local state');
      set({ items: currentItems });
    }
  },
}));