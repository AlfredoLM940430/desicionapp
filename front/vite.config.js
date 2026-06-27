import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // IMPORTANTE: Quita maplibre-gl de exclude para que Vite lo procese
  optimizeDeps: {
    include: ['react-map-gl', 'maplibre-gl']
  },
  esbuild: {
    keepNames: true,
    minifyIdentifiers: false,
  },
  build: {
    commonjsOptions: {
      include: [/maplibre-gl/, /node_modules/]
    },
    sourcemap: false
  }
})