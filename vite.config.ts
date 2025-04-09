import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    // Increase timeouts for file operations
    esbuildOptions: {
      keepNames: true,
      target: 'esnext',
      // Increase read/write timeouts
      tsconfigRaw: {
        compilerOptions: {
          target: 'esnext',
        },
      },
    },
  },
  server: {
    watch: {
      // Switch to polling which can be more reliable on some file systems
      usePolling: true,
      // Increase polling interval to reduce CPU usage
      interval: 2000,
      // More aggressive ignoring of files to reduce watch load
      ignored: ['**/node_modules/**', '**/.git/**', '**/.*', '**/*.log'],
    },
    hmr: {
      // Increase timeout for HMR connection
      timeout: 5000,
    },
    // Add proxy configuration for API endpoints
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Add build options to increase timeout
  build: {
    // Increase timeout for asset processing
    assetsInlineLimit: 4096,
    // Higher timeout for build operations
    reportCompressedSize: false,
    // Reduce file system load during build
    emptyOutDir: true,
    // Increase the warning limit for chunk sizes
    chunkSizeWarningLimit: 1000,
    // Configure Rollup for better code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for major dependencies
          if (id.includes('node_modules')) {
            // Group React and all React-related packages together
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router') || 
                id.includes('@stripe/react-stripe-js') ||
                id.includes('react-hot-toast') ||
                id.includes('react-icons')) {
              return 'react-vendor';
            }
            // UI libraries can be grouped separately
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui';
            }
            // Handle known libraries that depend on React
            if (id.includes('@supabase/auth-helpers-react') || 
                id.includes('framer-motion')) {
              return 'react-deps';
            }
            return 'deps'; // Other dependencies
          }
        }
      }
    }
  },
});
