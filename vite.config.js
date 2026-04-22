import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: 'SPPG Simbangwetan',
        short_name: 'SPPG',
        description: 'Sistem Pengelolaan Pangan Gizi Simbangwetan',
        theme_color: '#667eea',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  base: '/',
  server: {
    port: 3456,
    strictPort: true, // Fail if port is already in use
    host: true, // Expose to network for Cloudflare tunnel
    allowedHosts: [
      'idrg-test.my.id',
      'localhost',
      '.my.id' // Allow all subdomains of my.id
    ],
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
