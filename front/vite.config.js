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
  build: {
    commonjsOptions: {
      include: [/maplibre-gl/, /node_modules/]
    },
    minify: 'esbuild', // O false si quieres debugear el código real en producción
    sourcemap: false
  }
})