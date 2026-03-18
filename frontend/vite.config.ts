import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set `base` so built assets are referenced under /GITBIO/ when served from GitHub Pages
export default defineConfig({
  base: '/GITBIO/',
  plugins: [react()],
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
