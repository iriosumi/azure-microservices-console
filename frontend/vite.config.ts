import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  server: {
    port: 5173,
    proxy: {
      // Dev: proxy /api calls to Spring Boot backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Production build goes directly into Spring Boot static resources
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
  },
})
