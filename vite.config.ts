import { readFileSync } from 'fs';
import path from 'path';

import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Read package.json to get version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      // The default leaves pendingComponent in the main bundle, and with it the
      // skeletons of every page (sidebar, data grids, dialogs), which the sign-in
      // pages then download too. The router preloads it with the route's chunk.
      codeSplittingOptions: {
        defaultBehavior: [
          ['component'],
          ['pendingComponent'],
          ['errorComponent'],
          ['notFoundComponent']
        ]
      }
    }),
    react(),
    // The parser is forced to TSX because the plugin infers it from the file
    // extension, which TanStack Router's `?tsr-split=...` ids hide. Ceiling:
    // `<T>(x) => ...` in a .ts file that uses a Lingui macro won't parse
    // (write `<T,>`); drop the override once the plugin strips the query.
    lingui({
      macroTransform: { parser: { syntax: 'typescript', tsx: true } }
    })
  ],
  server: {
    // No browser to open on a CI runner (or when Playwright starts Vite)
    open: !process.env.CI
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      shared: path.resolve(import.meta.dirname, './shared')
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  optimizeDeps: {
    exclude: ['crypto']
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
