/**
 * Library build for design-sync.
 *
 * The UI components use Lingui macros (`@lingui/react/macro`), which only work
 * once `@lingui/babel-plugin-lingui-macro` has rewritten them. The converter
 * bundles with bare esbuild and has no babel, so pointing it at `src/` makes it
 * resolve the macro packages for real and drag in `@lingui/conf` → cosmiconfig
 * → jiti → node builtins, which cannot bundle for a browser.
 *
 * So we pre-build with the repo's own toolchain and hand the converter the
 * result. React stays external — the converter maps it onto `window.React`.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [
    react({ babel: { plugins: ['@lingui/babel-plugin-lingui-macro'] } }),
    lingui()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      shared: path.resolve(__dirname, '../shared')
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  build: {
    outDir: 'ds-dist',
    emptyOutDir: false,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, '.cache/ds-entry.ts'),
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client'
      ]
    }
  }
});
