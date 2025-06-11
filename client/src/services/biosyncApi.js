import { BASE_URL, BIOSYNC_ENDPOINTS } from '../config/api.js';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// BioSync API Service
export const biosyncApi = {

  // Mood Tracking
  async logMood(moodData) {
    const response = await fetch(`${BASE_URL}/api/biosync/mood`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(moodData)
    });
    return handleResponse(response);
  },

  async getMoodHistory(limit = 30) {
    const response = await fetch(`${BASE_URL}/api/biosync/mood/history?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Meditation
  async logMeditationSession(sessionData) {
    const response = await fetch(`${BASE_URL}/api/biosync/meditation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionData)
    });
    return handleResponse(response);
  },

  async getMeditationHistory() {
    const response = await fetch(`${BASE_URL}/api/biosync/meditation/history`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Wellness Challenges
  async joinChallenge(challengeData) {
    const response = await fetch(`${BASE_URL}/api/biosync/challenges/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(challengeData)
    });
    const result = await handleResponse(response);

    // Return the result as-is since backend handles success response
    return result;
  },

  async updateChallengeProgress(challengeId, progressData) {
    const response = await fetch(`${BASE_URL}/api/biosync/challenges/${challengeId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData)
    });
    return handleResponse(response);
  },

  async getChallenges() {
    const response = await fetch(`${BASE_URL}/api/biosync/challenges`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },



  // Inspiration
  async saveInspiration(inspirationData) {
    const response = await fetch(`${BASE_URL}/api/biosync/inspiration/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inspirationData)
    });
    return handleResponse(response);
  },

  async getSavedInspiration(type = null, limit = 20) {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${BASE_URL}/api/biosync/inspiration?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async removeInspiration(inspirationId) {
    const response = await fetch(`${BASE_URL}/api/biosync/inspiration/${inspirationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Analytics
  async getAnalytics() {
    const response = await fetch(`${BASE_URL}/api/biosync/analytics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Achievements
  async getAchievements() {
    const response = await fetch(`${BASE_URL}/api/biosync/achievements`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Settings
  async updatePreferences(preferences) {
    const response = await fetch(`${BASE_URL}/api/biosync/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    return handleResponse(response);
  },

  async getPreferences() {
    const response = await fetch(`${BASE_URL}/api/biosync/preferences`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Utility functions for offline support
export const biosyncUtils = {
  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get user ID from token
  getUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  // Cache data for offline use
  cacheData(key, data) {
    try {
      localStorage.setItem(`biosync_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  },

  // Get cached data
  getCachedData(key, maxAge = 5 * 60 * 1000) { // 5 minutes default
    try {
      const cached = localStorage.getItem(`biosync_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`biosync_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  },

  // Clear all cached data
  clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('biosync_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Sync offline data when back online
  async syncOfflineData() {
    // This would handle syncing any offline mood logs, etc.
    // Implementation depends on specific offline strategy
    console.log('Syncing offline BioSync data...');
  }
};

// Error handling wrapper
export const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      console.error('BioSync API Error:', error);

      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('403')) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      // For other errors, you might want to show a user-friendly message
      throw new Error(error.message || 'Something went wrong. Please try again.');
    }
  };
};

// Export wrapped API with error handling
export const safeBiosyncApi = Object.keys(biosyncApi).reduce((acc, key) => {
  acc[key] = withErrorHandling(biosyncApi[key]);
  return acc;
}, {});

export default safeBiosyncApi;
