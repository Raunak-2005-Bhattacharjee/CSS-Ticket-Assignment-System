// Frontend/src/config.js
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API base URL - change this to your backend URL when deployed
export const API_BASE_URL = isProduction 
  ? 'https://css-backend.onrender.com'  // Replace with your actual backend URL
  : 'http://localhost:3000';

// Helper function to build API endpoints
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
