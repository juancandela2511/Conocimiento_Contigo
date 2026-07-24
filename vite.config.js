import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inyectamos nuestro propio service worker
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // Configuración del manifest para que la app sea "instalable"
      manifest: {
        name: 'Aprende Contigo',
        short_name: 'Aprende',
        description: 'Tu plataforma de aprendizaje online.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Debes crear estos íconos y ponerlos en la carpeta 'public'
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Debes crear estos íconos y ponerlos en la carpeta 'public'
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
