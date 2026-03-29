import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // if using React
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),       // keep whatever framework plugin you use
    tailwindcss(), // tailwind v4 Vite plugin
  ],
})