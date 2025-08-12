import axios from 'axios';

// Axios client configured with inline timeout and headers.
// baseURL is sourced from environment (VITE_API_BASE_URL).
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Pass through responses and errors unchanged
client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);


