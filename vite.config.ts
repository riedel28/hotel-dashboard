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
      autoCodeSplitting: true
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
    open: true
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
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-'))
              return 'vendor-recharts';
            if (id.includes('@fontsource')) return 'vendor-fonts';
            if (id.includes('react-day-picker') || id.includes('dayjs'))
              return 'vendor-date';
            if (id.includes('react-hook-form') || id.includes('@hookform'))
              return 'vendor-forms';
            if (id.includes('@dnd-kit')) return 'vendor-dnd-kit';
            if (id.includes('@tanstack/react-table'))
              return 'vendor-tanstack-table';
          }
        }
      }
    }
  }
});
