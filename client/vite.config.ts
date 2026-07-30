import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ─── Development Server ──────────────────────────────────────
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // ─── Production Build Optimization ──────────────────────────
  build: {
    target: 'es2020',
    sourcemap: false,                    // Disable source maps in production
    chunkSizeWarningLimit: 600,          // Warn at 600KB (default 500KB)
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        // Each chunk is independently cached — only changed chunks re-download
        manualChunks: {
          // React core — changes rarely
          'vendor-react': ['react', 'react-dom'],

          // React Router — changes occasionally
          'vendor-router': ['react-router-dom'],

          // TanStack Query — data layer
          'vendor-query': ['@tanstack/react-query'],

          // Zustand — state management
          'vendor-state': ['zustand'],

          // Socket.IO client — real-time layer
          'vendor-socket': ['socket.io-client'],

          // Lucide icons — large icon set
          'vendor-icons': ['lucide-react'],

          // Animation library
          'vendor-animation': ['framer-motion'],

          // Utility libraries
          'vendor-utils': ['axios', 'zod', 'clsx', 'tailwind-merge'],
        },
        // Consistent asset file naming with content hash for cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
});
