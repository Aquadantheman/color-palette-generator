// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // or '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/color-palettes/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
