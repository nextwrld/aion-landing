import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  // Absolute base: nested routes (/soluciones/gimnasios) must resolve /assets from the root.
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    // Local dev: /api/contact is served by `wrangler dev` (default port 8787).
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
