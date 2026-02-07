import axios, { AxiosError, isAxiosError } from 'axios';
import z from 'zod';

type UnauthorizedHandler = (() => void) | null;
let unauthorizedHandler: UnauthorizedHandler = null;

function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

// Axios client configured with inline timeout and headers.
// baseURL is sourced from environment (VITE_API_BASE_URL).
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Pass through responses and errors unchanged
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        unauthorizedHandler?.();
      }
    }
    return Promise.reject(error);
  }
);

function handleApiError(err: unknown, context: string): never {
  if (isAxiosError(err)) {
    const ae = err as AxiosError<{ error?: string; message?: string }>;
    throw new Error(
      ae.response?.data?.error ?? ae.response?.data?.message ?? ae.message
    );
  }
  if (err instanceof z.ZodError) {
    console.error(`Validation error (${context}):`, err.issues);
    throw new Error('Invalid API response format');
  }
  throw err instanceof Error ? err : new Error(String(err));
}

export { client, handleApiError, setUnauthorizedHandler };
