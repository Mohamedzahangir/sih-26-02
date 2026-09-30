import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import kioskServices from './server/viteServices.mjs';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), kioskServices()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
