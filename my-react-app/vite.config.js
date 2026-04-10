import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = (env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

  return {
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
    ],
    server: {
      host: true,
      port: 5174, // твой локальный порт
      allowedHosts: 'all',
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
})
