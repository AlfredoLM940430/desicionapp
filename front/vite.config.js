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
    esbuildOptions: {
      target: 'esnext',
    }
  },
  esbuild: {
    keepNames: true,
    minifyIdentifiers: false,
    supported: {
      bigint: false
    }
  },
  build: {
    commonjsOptions: {
      include: [/maplibre-gl/, /node_modules/]
    },
    rollupOptions: {
      external: ['maplibre-gl'],
    },
    sourcemap: false
  }
})