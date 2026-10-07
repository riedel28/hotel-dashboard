import path from 'path';

import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), lingui({ macroTransform: true })],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    // Exclude backend tests - they have their own config and require NODE_ENV=test
    // ds-dist/src is a symlink to src; without excluding it every test runs
    // twice.
    exclude: [
      '**/node_modules/**',
      '**/backend/**',
      '**/e2e/**',
      '**/ds-dist/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      shared: path.resolve(import.meta.dirname, './shared')
    }
  }
});
