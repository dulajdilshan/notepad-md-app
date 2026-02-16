import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/notepad-md-app/', // Update this if your repo name is different
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
