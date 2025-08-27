// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/color-palettes/', // IMPORTANT for username.github.io/color-palettes/
})
