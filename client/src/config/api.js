/**
 * API Configuration
 *
 * This file contains all API endpoints used in the application.
 * When deploying the backend, update the BASE_URL to your deployed backend URL.
 */

// Set the base URL for all API calls
// Change this to your deployed backend URL when deploying
// In production builds, process.env.NODE_ENV might not be properly set
// So we'll check if we're running on the deployed domain
const isProduction = typeof window !== 'undefined' &&
  (window.location.hostname !== 'localhost' &&
   window.location.hostname !== '127.0.0.1');

// For Vite, we can also check import.meta.env.PROD
const isViteProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

export const BASE_URL = (isProduction || isViteProduction)
  ? 'https://s89-madhukiran-fashionmerge.onrender.com' // Replace with your actual deployed backend URL
  : 'http://localhost:5000';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  SIGNUP: `${BASE_URL}/signup`,
  FORGOT_PASSWORD: `${BASE_URL}/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/reset-password`,
  GOOGLE_AUTH: `${BASE_URL}/auth/google`,
  CHECK_AUTH: `${BASE_URL}/check-auth`,
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: (userId) => `${BASE_URL}/userprofile/${userId}`,
  UPDATE_PROFILE: (userId) => `${BASE_URL}/update-profile/${userId}`,
  USER_ACTIVITY: (userId) => `${BASE_URL}/user-activity/${userId}`,
  DELETE_ACCOUNT: (userId) => `${BASE_URL}/delete-account/${userId}`,
};

// Upload endpoints
export const UPLOAD_ENDPOINTS = {
  UPLOAD_IMAGE: `${BASE_URL}/api/upload/upload`,
  DELETE_IMAGE: (publicId) => `${BASE_URL}/api/upload/delete/${publicId}`,
  UPLOAD_WARDROBE_IMAGE: `${BASE_URL}/upload-wardrobe-image`,
};

// Chatbot endpoint
export const CHATBOT_ENDPOINT = 'https://equal-cristy-madhukiran-6b9e128e.koyeb.app/chat';

// Stripe endpoints
export const STRIPE_ENDPOINTS = {
  CREATE_PAYMENT_INTENT: `${BASE_URL}/api/stripe/create-payment-intent`,
  PROCESS_PAYMENT: `${BASE_URL}/api/stripe/process-payment`,
};

// Purchases endpoints
export const PURCHASES_ENDPOINTS = {
  GET_PURCHASES: `${BASE_URL}/api/purchases`,
  ADD_PURCHASE: `${BASE_URL}/api/purchases/add`,
};

// Polls endpoints
export const POLLS_ENDPOINTS = {
  GET_POLLS: `${BASE_URL}/api/polls`,
  GET_POLL: (pollId) => `${BASE_URL}/api/polls/${pollId}`,
  CREATE_POLL: `${BASE_URL}/api/polls`,
  DELETE_POLL: (pollId) => `${BASE_URL}/api/polls/${pollId}`,
  VOTE_POLL: (pollId) => `${BASE_URL}/api/polls/${pollId}/vote`,
  COMMENT_POLL: (pollId) => `${BASE_URL}/api/polls/${pollId}/comment`,
  GET_NOTIFICATIONS: `${BASE_URL}/api/polls/notifications`,
  MARK_NOTIFICATION_READ: (notificationId) => `${BASE_URL}/api/polls/notifications/${notificationId}/read`,
};

// BioSync endpoints
export const BIOSYNC_ENDPOINTS = {
  PROFILE: `${BASE_URL}/api/biosync/profile`,
  LOG_MOOD: `${BASE_URL}/api/biosync/mood`,
  MOOD_HISTORY: (limit = 30) => `${BASE_URL}/api/biosync/mood/history?limit=${limit}`,
  LOG_MEDITATION: `${BASE_URL}/api/biosync/meditation`,
  MEDITATION_HISTORY: `${BASE_URL}/api/biosync/meditation/history`,
  JOIN_CHALLENGE: `${BASE_URL}/api/biosync/challenges/join`,
  UPDATE_CHALLENGE: (challengeId) => `${BASE_URL}/api/biosync/challenges/${challengeId}/progress`,
  GET_CHALLENGES: `${BASE_URL}/api/biosync/challenges`,
  SAVE_INSPIRATION: `${BASE_URL}/api/biosync/inspiration/save`,
  GET_INSPIRATION: (type = null, limit = 20) => {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    queryParams.append('limit', limit.toString());
    return `${BASE_URL}/api/biosync/inspiration?${queryParams}`;
  },
  REMOVE_INSPIRATION: (inspirationId) => `${BASE_URL}/api/biosync/inspiration/${inspirationId}`,
  GET_ANALYTICS: `${BASE_URL}/api/biosync/analytics`,
  GET_ACHIEVEMENTS: `${BASE_URL}/api/biosync/achievements`,
  UPDATE_PREFERENCES: `${BASE_URL}/api/biosync/preferences`,
  GET_PREFERENCES: `${BASE_URL}/api/biosync/preferences`,
};

// WebSocket endpoint
export const SOCKET_URL = (isProduction || isViteProduction)
  ? 'https://s89-madhukiran-fashionmerge.onrender.com' // Same as backend URL
  : 'http://localhost:5000';

export default {
  BASE_URL,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  UPLOAD_ENDPOINTS,
  CHATBOT_ENDPOINT,
  STRIPE_ENDPOINTS,
  PURCHASES_ENDPOINTS,
  POLLS_ENDPOINTS,
  BIOSYNC_ENDPOINTS,
  SOCKET_URL,
};
