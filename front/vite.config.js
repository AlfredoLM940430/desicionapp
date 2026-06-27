import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- Corregido: 'plugin-react' en vez de 'react-plugin'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['maplibre-gl']
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