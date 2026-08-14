import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5180,
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
  plugins: [
    {
      name: 'rewrite-seller-paths',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const [pathname] = (req.url || '').split('?');
          const reserved = ['/admin.html', '/seller-admin.html', '/index.html', '/admin', '/seller-admin'];
          if (
            pathname &&
            pathname !== '/' &&
            !pathname.includes('.') &&
            !reserved.includes(pathname) &&
            !pathname.startsWith('/@') &&
            !pathname.startsWith('/node_modules') &&
            !pathname.startsWith('/lifenuri-proxy') &&
            !pathname.startsWith('/src')
          ) {
            req.url = '/index.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        sellerAdmin: resolve(__dirname, 'seller-admin.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/convex')) {
            return 'convex';
          }
        }
      }
    },
  },
});
