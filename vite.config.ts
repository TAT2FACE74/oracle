import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Relative base (2026-11-08): '/oracle/' was for GitHub Pages only and made the
// Vercel homepage load /oracle/assets/* → 404 → blank white page. './' resolves
// correctly at BOTH the Vercel root and the /oracle/ Pages subpath, and the app
// already builds image paths from import.meta.env.BASE_URL.
export default defineConfig({
  base: './',
  plugins: [react()],
})
