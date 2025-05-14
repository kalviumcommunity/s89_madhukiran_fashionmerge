import { create } from 'zustand';
import { BASE_URL } from '../config/api';

export const useWardrobeStore = create((set, get) => ({
  wardrobe: [],
  isLoading: false,
  error: null,

  // Set wardrobe items directly (used when loading from server)
  setWardrobe: (wardrobe) => {
    set({ wardrobe });
  },

  // Add a new item to the wardrobe
  addItem: (item) => {
    set((state) => ({
      wardrobe: [...state.wardrobe, item]
    }));
  },

  // Remove an item from the wardrobe
  removeItem: (index) => {
    set((state) => ({
      wardrobe: state.wardrobe.filter((_, i) => i !== index)
    }));
  },

  // Clear all wardrobe items
  clearWardrobe: () => {
    set({ wardrobe: [] });
  },

  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // Set error state
  setError: (error) => {
    set({ error });
  },

  // Save wardrobe to the server
  saveWardrobeToServer: async (userId, token) => {
    if (!userId || !token) {
      console.log('User not logged in, wardrobe not saved to server');
      return false;
    }

    try {
      set({ isLoading: true, error: null });
      const wardrobe = get().wardrobe;
      console.log('Saving wardrobe to server for user:', userId, 'Items count:', wardrobe.length);

      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wardrobe }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to save wardrobe: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Wardrobe saved successfully:', result);
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Error saving wardrobe:', error);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  // Load wardrobe from the server
  loadWardrobeFromServer: async (userId, token) => {
    if (!userId || !token) {
      console.log('User not logged in, cannot load wardrobe from server');
      return false;
    }

    try {
      set({ isLoading: true, error: null });
      console.log('Fetching wardrobe for user:', userId);
      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to fetch wardrobe: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Server response for wardrobe:', result);

      if (result.data && result.data.wardrobe) {
        console.log('Fetched wardrobe from server:', result.data.wardrobe);
        set({ wardrobe: result.data.wardrobe, isLoading: false });
        return true;
      } else {
        console.log('No wardrobe found on server');
        set({ wardrobe: [], isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Error fetching wardrobe:', error);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  // Add a new item to the wardrobe and save to server
  addItemAndSave: async (item, userId, token) => {
    try {
      set({ isLoading: true, error: null });

      // Add to local state
      get().addItem(item);

      // Save to server if logged in
      if (userId && token) {
        await get().saveWardrobeToServer(userId, token);
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Error adding wardrobe item:', error);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  // Remove an item from the wardrobe and save to server
  removeItemAndSave: async (index, userId, token) => {
    try {
      set({ isLoading: true, error: null });

      // Remove from local state
      get().removeItem(index);

      // Save to server if logged in
      if (userId && token) {
        await get().saveWardrobeToServer(userId, token);
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Error removing wardrobe item:', error);
      set({ isLoading: false, error: error.message });
      return false;
    }
  }
}));
