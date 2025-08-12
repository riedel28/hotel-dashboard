// API Configuration
// This file centralizes all API-related configuration

// Environment-based API configuration
const API_CONFIG = {
  // Base URL for the API - can be overridden by environment variables
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',

  // API endpoints
  endpoints: {
    reservations: '/reservations',
    productCategories: '/product-categories',
    products: '/products'
  },

  // Default headers
  defaultHeaders: {
    'Content-Type': 'application/json'
  },

  // Timeout configuration
  timeout: 10000 // 10 seconds
} as const;

// Export the configuration for direct access if needed
export { API_CONFIG };

// Type exports for better type safety
export type ApiEndpoint = keyof typeof API_CONFIG.endpoints;
