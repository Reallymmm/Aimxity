import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  // Electron loads packaged pages from file://, so bundled assets must use relative paths.
  base: './',
  build: { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), overlay: resolve(__dirname, 'overlay.html') } } },
  server: { host: '0.0.0.0', strictPort: true, allowedHosts: true }
});
