import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// WHY A DEV PROXY INSTEAD OF CORS ON THE BACKEND:
// The backend is explicitly off-limits for changes in this module. Rather
// than adding CORS middleware there, the Vite dev server proxies any
// request starting with /api to the real backend at localhost:5000. From
// the browser's point of view, every request stays same-origin (talking
// to the Vite dev server), so no CORS headers are ever needed — the proxy
// forwards server-to-server. This also means the API layer can use plain
// relative paths ('/api/v1/...'), which keeps working unchanged if this
// build is ever served from behind the same origin as the API in
// production too.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
