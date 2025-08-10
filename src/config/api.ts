// API Configuration
// This file centralizes all API-related configuration

// Environment-based API configuration
const API_CONFIG = {
  // Base URL for the API - can be overridden by environment variables
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',

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

// Helper function to build full API URLs
export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string | number>
): string {
  const url = new URL(endpoint, API_CONFIG.baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

// Helper function to get endpoint URL
export function getEndpointUrl(
  endpoint: keyof typeof API_CONFIG.endpoints
): string {
  return API_CONFIG.endpoints[endpoint];
}

// Helper function to build URL for a specific resource by ID
export function buildResourceUrl(
  endpoint: keyof typeof API_CONFIG.endpoints,
  id: string | number,
  params?: Record<string, string | number>
): string {
  const resourcePath = `${getEndpointUrl(endpoint)}/${id}`;
  return buildApiUrl(resourcePath, params);
}

// Export the configuration for direct access if needed
export { API_CONFIG };

// Type exports for better type safety
export type ApiEndpoint = keyof typeof API_CONFIG.endpoints;
