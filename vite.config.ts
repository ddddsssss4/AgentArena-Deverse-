import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // Proxy all API calls to Cloudflare Worker
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
        // Proxy WebSocket connections to Cloudflare Worker
        '/ws': {
          target: 'ws://localhost:8787',
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
