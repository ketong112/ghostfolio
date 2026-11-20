import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the project site at /ghostfolio/
  base: '/ghostfolio/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
