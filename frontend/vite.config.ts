import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Locolive',
        short_name: 'Locolive',
        description: 'Live location based social feed',
        theme_color: '#ff3b8e',
        background_color: '#0a0a0c',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          // MEDIA CACHING (CacheFirst)
          {
            urlPattern: /\/api\/media\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 604800  // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              rangeRequests: true
            }
          },
          // FEED CACHING (StaleWhileRevalidate)
          {
            urlPattern: /\/api\/(feed|stories|reels)\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-public-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400  // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // LEGACY POSTS FEED
          {
            urlPattern: /\/api\/posts\/feed/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-public-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // NETWORK ONLY (No caching for sensitive data)
          {
            urlPattern: /\/api\/(auth|profile\/me|messages)/,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'no-cache'
            }
          },
          // WEBSOCKET
          {
            urlPattern: /\/ws\//,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'no-cache'
            }
          },
          // LOCATION (always fresh)
          {
            urlPattern: /\/api\/location\//,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'no-cache'
            }
          }
        ]
      }
    })
  ]
})
