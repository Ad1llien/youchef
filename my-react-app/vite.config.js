import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";




// https://vite.dev/config/
export default defineConfig({
  plugins: [svgr()],
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: 'all',
    port: 5173, // твой локальный порт
    allowedHosts: ['unmerchandised-hypothermal-marilyn.ngrok-free.dev'],
  },
})
