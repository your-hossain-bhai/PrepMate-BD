import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'public',
        filename: 'sw.js',
        injectRegister: 'auto',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          id: '/',
          name: 'PrepMate BD',
          short_name: 'PrepMate BD',
          description: 'SSC & HSC AI Board Exam Preparation, Smart Daily Reminders & Offline Quiz Practice Vault.',
          start_url: '/',
          display: 'standalone',
          background_color: '#002b24',
          theme_color: '#002b24',
          orientation: 'portrait',
          icons: [
            {
              src: '/logo.png',
              sizes: '192x192',
              type: "image/png",
              purpose: "any"
            },
            {
              src: '/logo.png',
              sizes: '512x512',
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist',
    }
  };
});
