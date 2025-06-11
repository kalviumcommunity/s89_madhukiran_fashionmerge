import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeBiosyncApi, biosyncUtils } from '../services/biosyncApi';

const BioSyncContext = createContext();

export const useBioSync = () => {
  const context = useContext(BioSyncContext);
  if (!context) {
    throw new Error('useBioSync must be used within a BioSyncProvider');
  }
  return context;
};

export const BioSyncProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logMood = async (moodData) => {
    try {
      setError(null);
      const response = await safeBiosyncApi.logMood(moodData);

      if (response.success) {
        return response;
      }
    } catch (err) {
      console.error('Error logging mood:', err);
      setError('Failed to log mood');
      throw err;
    }
  };

  const logMeditationSession = async (sessionData) => {
    try {
      setError(null);
      const response = await safeBiosyncApi.logMeditationSession(sessionData);

      if (response.success) {
        return response;
      }
    } catch (err) {
      console.error('Error logging meditation:', err);
      setError('Failed to log meditation session');
      throw err;
    }
  };

  const joinChallenge = async (challengeData) => {
    try {
      setError(null);
      const response = await safeBiosyncApi.joinChallenge(challengeData);

      if (response.success) {
        return response;
      }
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError('Failed to join challenge');
      throw err;
    }
  };

  const updateChallengeProgress = async (challengeId, progressData) => {
    try {
      setError(null);
      const response = await safeBiosyncApi.updateChallengeProgress(challengeId, progressData);

      if (response.success) {
        return response;
      }
    } catch (err) {
      console.error('Error updating challenge progress:', err);
      setError('Failed to update challenge progress');
      throw err;
    }
  };

  const saveInspiration = async (inspirationData) => {
    try {
      setError(null);
      const response = await safeBiosyncApi.saveInspiration(inspirationData);

      if (response.success) {
        return response;
      }
    } catch (err) {
      console.error('Error saving inspiration:', err);
      setError('Failed to save inspiration');
      throw err;
    }
  };

  const getAnalytics = async () => {
    try {
      setError(null);
      const response = await safeBiosyncApi.getAnalytics();
      return response;
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics');
      throw err;
    }
  };

  // Clear cache when user logs out
  const clearCache = () => {
    setError(null);
    biosyncUtils.clearCache();
  };

  // Computed values
  const isAuthenticated = biosyncUtils.isAuthenticated();

  const value = {
    // State
    loading,
    error,
    isAuthenticated,

    // Actions
    logMood,
    logMeditationSession,
    joinChallenge,
    updateChallengeProgress,
    saveInspiration,
    getAnalytics,
    clearCache,
    setError
  };

  return (
    <BioSyncContext.Provider value={value}>
      {children}
    </BioSyncContext.Provider>
  );
};

export default BioSyncContext;
