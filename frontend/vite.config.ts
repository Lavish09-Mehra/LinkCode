import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // vercel.json's rewrites only exist in a deployment. In development the same
  // same-origin paths are used by the app and proxied here instead, so the
  // frontend code never has to know which port a service lives on.
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/tools": "http://localhost:8000",
      // short links are ten digits at the root, the same shape as production
      "^/[0-9]{10}$": "http://localhost:8000",
    },
  },
})
