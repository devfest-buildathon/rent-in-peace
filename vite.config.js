import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg', 'assets/logo-icon.png', 'assets/logo-full.png'],
      manifest: {
        name: 'Rent in Peace — Smart Rental Architecture',
        short_name: 'Rent in Peace',
        description: 'AI-assisted residential lease drafting and rental ledger for Philippine boarding houses and bedspaces.',
        theme_color: '#144C2E',
        background_color: '#E4EFE9',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/assets/logo-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
      }
    }),
    {
      name: 'pwa-virtual-register-fallback',
      enforce: 'post',
      resolveId(id) {
        if (id === 'virtual:pwa-register' || id === 'virtual:pwa-register/react') {
          return '\0' + id;
        }
      },
      load(id) {
        if (id === '\0virtual:pwa-register' || id === '\0virtual:pwa-register/react') {
          return 'export function registerSW() { return async () => {}; }';
        }
      }
    }
  ],
})
