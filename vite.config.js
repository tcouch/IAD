import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BASE_PATH__: JSON.stringify(process.env.VITE_BASE_PATH || '/')
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3000
  },
  // Get base path from env
  base: process.env.VITE_BASE_PATH || '/'
}) 