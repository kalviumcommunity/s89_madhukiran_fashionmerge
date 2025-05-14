/**
 * API Configuration
 * 
 * This file contains all API endpoints used in the application.
 * When deploying the backend, update the BASE_URL to your deployed backend URL.
 */

// Set the base URL for all API calls
// Change this to your deployed backend URL when deploying
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-deployed-backend-url.com' // Replace with your actual deployed backend URL
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

export default {
  BASE_URL,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  UPLOAD_ENDPOINTS,
  CHATBOT_ENDPOINT,
  STRIPE_ENDPOINTS,
  PURCHASES_ENDPOINTS,
};
