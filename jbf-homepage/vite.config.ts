import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// The API's CORS policy only allows https://localhost:2717, so the dev server must use exactly that.
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: { port: 2717, strictPort: true },
})
