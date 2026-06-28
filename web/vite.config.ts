import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const fromRoot = (path: string) =>
  decodeURIComponent(new URL(path, import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fromRoot('./index.html'),
        login: fromRoot('./login.html'),
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
