import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: 'all',
    port: 5173, // твой локальный порт
    allowedHosts: ['unmerchandised-hypothermal-marilyn.ngrok-free.dev'],
  },
})
