/// <reference types="vite/client" />

// Lingui's Vite plugin compiles .po catalogs into modules
declare module '*.po' {
  import type { Messages } from '@lingui/core';
  export const messages: Messages;
}
