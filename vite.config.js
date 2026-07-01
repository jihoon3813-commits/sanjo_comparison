import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    proxy: {
      '/lifenuri-proxy': {
        target: 'https://boram.lifenuri.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lifenuri-proxy/, ''),
        headers: {
          'Referer': 'https://boram.lifenuri.com/shop/themesgroup/135',
          'Origin': 'https://boram.lifenuri.com'
        }
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
