import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  worker: {
    format: 'es'
  },
  esbuild: {
    keepNames: true,
    minifyIdentifiers: false,
  },
  build: {
    rollupOptions: {
      external: ['maplibre-gl']
    },
    sourcemap: false
  }
})