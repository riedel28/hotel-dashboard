import '@testing-library/jest-dom';
import { i18n } from '@lingui/core';

// Setup localStorage mock for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Make localStorage available globally
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}

if (typeof window !== 'undefined' && typeof window.localStorage === 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}

// Setup i18n for tests
i18n.loadAndActivate({
  locale: 'en',
  messages: {}
});
