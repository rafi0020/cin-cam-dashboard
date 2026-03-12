import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cin-cam-dashboard/',  // must match your GitHub repo name exactly
})
