import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for BlockBridge ScamGuard - Production Ready
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
