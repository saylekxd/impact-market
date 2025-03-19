import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
      '@': resolve(__dirname, './src')
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
  },
});
