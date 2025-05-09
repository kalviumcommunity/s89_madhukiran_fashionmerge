import { create } from 'zustand';

export const useMusicStore = create((set, get) => ({
  // Current playing music URL
  currentMusic: null,
  
  // Playing state
  isPlaying: false,
  
  // Volume (0-100)
  volume: 80,
  
  // Minimized state for the player
  isMinimized: false,
  
  // Set the current music
  setCurrentMusic: (url) => {
    set({ currentMusic: url });
  },
  
  // Toggle play/pause
  togglePlayPause: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },
  
  // Set playing state directly
  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },
  
  // Set volume
  setVolume: (volume) => {
    set({ volume });
  },
  
  // Toggle minimized state
  toggleMinimized: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },
  
  // Set minimized state directly
  setIsMinimized: (isMinimized) => {
    set({ isMinimized });
  },
  
  // Play a specific playlist
  playPlaylist: (url) => {
    const state = get();
    if (state.currentMusic === url) {
      // Toggle play/pause if it's the same playlist
      set((state) => ({ isPlaying: !state.isPlaying }));
    } else {
      // Start playing a new playlist
      set({ currentMusic: url, isPlaying: true, isMinimized: false });
    }
  },
  
    // Stop playing and close the player
  stopPlayback: () => {
    set({ currentMusic: null, isPlaying: false });
  },
}));